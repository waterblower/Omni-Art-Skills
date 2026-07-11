---
name: image-quality-check
description: 通用 AI 图片质量闸门。用于在接受图片、作为后续参考、进入风格验证或交付前，检查文件可读性、任务 prompt/简报符合度、主体与身份、解剖和物理逻辑、参考图用途、构图可读性与通用生成伪影。适用于角色图、环境图、道具图、概念图、漫画页、风格测试图和批量图片计划。不负责判定候选图是否忠实匹配目标画风；风格匹配使用 validate-style-match。
---

# 图片质量检查

## 职责边界

本技能是通用质量闸门，不是风格相似度评审器。

- 检查图片是否可读、完整、符合任务，以及是否可作为后续输入。
- 可检查当前 prompt 明确要求的媒介、色彩或光线，但不比较“与参考风格有多像”。
- 对 `style-distill` 生成的候选图，本技能先排除技术、内容和结构失败；通过后再交给 `validate-style-match`。
- 只返回判定和修复指令，不生成图片、不保存/复制图片、不直接改写计划。

## 输入

必需：

- 待检查图片。
- 对应的完整 prompt、任务简报或可核对的生成要求。
- 已传入的参考图及各自用途，如身份、服装、道具、环境、构图或动作。

可选：

- `task_id`、`target_image_path`、预期 `aspect_ratio`、文件格式、尺寸和 alpha 要求。
- 项目级连续性规则、安全边界和交付用途。

缺少可选字段不得阻塞会话内单图质检。缺少必需信息且无法核对时，返回 `BLOCKED`。

## 检查顺序

### 1. 技术完整性

在视觉判断前确认：

- 文件可解码、非空、有有效像素尺寸。
- 实际画幅与预期比例在合理容差内；未提供预期比例时只记录实际比例。
- 需要透明背景时确认 alpha 存在且边缘没有明显污染。
- 没有损坏、全黑/全透明、异常缩略图、随机水印、伪 UI 或签名。

文件无法读取时直接返回 `BLOCKED`。

### 2. 主体、身份与参考用途

- 主体类型、数量、年龄/状态、身份和物种符合任务。
- 人物的脸、发型、体型、服装、鞋履、配饰和装备使用正确的参考来源。
- 道具、动物、建筑、车辆、植物、食物、UI 或产品的结构和尺度可识别。
- 没有把风格参考中的具体人物/道具误复制到候选图，也没有让局部参考错误主导整张图。

### 3. 解剖、物理与接触逻辑

- 肢体数量、左右方向、关节连接、重心和受力关系成立。
- 手、脚、爪、翅、尾、衣料、装备与身体自然连接。
- 拿、递、扣、绑、推、拉、切、写、打开等接触点符合动作。
- 服装、鞋履、盔甲、包袋、首饰、工具与容器的穿戴/使用逻辑成立。

只有这些结构违反任务或参考规则时才判失败。超现实、立体主义、多肢生物、纸片人或有意的几何变形不得因为不写实而自动拒收。

### 4. Prompt / 任务符合度

- 必要地点、时间、天气、环境、主体、数量、动作、关系和道具出现。
- 景别、构图意图、焦点层级和画幅服务当前用途。
- 不使用记忆、相邻任务或无关项目设定补全当前 prompt。
- 图片虽然精致但未呈现核心任务内容时，不得通过。

### 5. 构图与可读性

- 主要事件、主体或资产用途能在几秒内读懂。
- 主体身份、动作关系、关键道具和环境信息的视觉层级清楚。
- 无关人物、杂物、文字或装饰不得抢走核心焦点。
- 主体的裁切、遮挡或缩小不得破坏身份、动作、结构或用途。

### 6. 通用生成伪影

检查重复人物/物件、融合边缘、局部噪点、过度锐化、不应出现的文字/水印、伪 UI、随机签名和参考图内容泄漏。

通用质检不使用“是否像目标画风”作为拒收理由。需要风格判断时，将通过图交给 `validate-style-match`。

## 决策状态

- `PASS`：通用技术、内容、结构和构图要求均通过。
- `PASS_WITH_NOTES`：可继续，但记录不影响当前用途的小瑕疵或使用限制。
- `REGENERATE_MINOR`：存在少量可定向修复的非核心问题。
- `REGENERATE_MAJOR`：主体、身份、解剖、物理、参考用途或核心任务失败。
- `BLOCKED`：文件不可读、必备输入缺失、生成器拒绝或无法在当前约束下安全/稳定生成。

`PASS` 和 `PASS_WITH_NOTES` 本身不执行保存。是否持久化由调用方和用户要求决定。

## 输出契约

```yaml
quality_result:
  schema_version: 1
  task_id: ""
  status: PASS | PASS_WITH_NOTES | REGENERATE_MINOR | REGENERATE_MAJOR | BLOCKED
  eligible_for_style_validation: true
  checks:
    technical_integrity: PASS | FAIL | NOT_CHECKED
    subject_and_identity: PASS | FAIL | NOT_APPLICABLE
    anatomy_and_physics: PASS | FAIL | NOT_APPLICABLE
    prompt_and_content: PASS | FAIL
    composition_and_readability: PASS | FAIL
    generation_artifacts: PASS | FAIL
  failures: []
  notes: []
  repair_directives: []
  next_step: validate_style_match | accept | regenerate | stop
```

规则：

- 只有 `PASS` 或不影响比较的 `PASS_WITH_NOTES` 可将 `eligible_for_style_validation` 设为 `true`。
- 对 `style-distill` 候选图，通过时 `next_step = validate_style_match`。
- `REGENERATE_*` 只返回当前失败相关的定向修复，不新增剧情或未授权设定。
- `BLOCKED` 只报告阻塞和可选替代方案，不擅自改变用户意图。

## 与风格流水线的交接

```text
style-distill 生成候选图
  -> image-quality-check
     -> PASS / PASS_WITH_NOTES: validate-style-match
     -> REGENERATE_*: style-distill 按 repair_directives 重生
     -> BLOCKED: 停止并报告
```

本技能不读取或覆盖 `style_validation`结论。通用质量通过只代表“可以进入风格比较”，不代表“风格已匹配”。

## 交付前检查

- [ ] 图片可读且技术属性已检查或明确标记 `NOT_CHECKED`。
- [ ] 主体、身份、参考用途、解剖/物理和 prompt 符合度已检查。
- [ ] 有意风格化没有被当成通用结构错误。
- [ ] 没有使用风格相似度作为本闸门的拒收理由。
- [ ] 没有保存、复制、生成或改写计划。
- [ ] `quality_result`、`eligible_for_style_validation` 和 `next_step` 完整。
