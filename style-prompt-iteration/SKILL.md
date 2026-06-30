---
name: style-prompt-iteration
description: Codex/ChatGPT 专用的纯美术风格提取/萃取/蒸馏/迭代技能。用户说 distill style、extract style、style extraction、style distillation、提取美术风格、萃取画风、反推风格、获得风格提示词时触发；一旦读入并用于参考图任务，必须先调用图片生成得到候选图，再实际对比参考图与候选图并循环修订，不得只输出提示词就结束。
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [image-style, prompt-iteration, art-direction, image-generation, style-matching, style-extraction, style-distillation, extract-style, distill-style]
    aliases: [style-extract, style-distill, art-style-extraction, art-style-distillation, extract-style-prompt, distill-style-prompt, 提取美术风格, 萃取画风, 反推风格, 获得风格提示词]
    related_skills: [image-art-direction]
---

# 纯美术风格提示词迭代

## 使用对象

本技能专门给 Codex / ChatGPT 这类可调用工具的代理使用，不是给纯聊天模型看的静态 prompt 写作指南。

触发词包括但不限于：`distill style`、`extract style`、`style extraction`、`style distillation`、`extract art style`、`distill art style`、`提取美术风格`、`提取画风`、`萃取画风`、`蒸馏风格`、`反推风格`、`获得风格提示词`、`从参考图获得风格`。

只要本技能被触发并读入，且任务对象是参考图/风格图，就必须默认进入生图迭代模式：读参考图、写初版风格 prompt、调用图片生成工具生成候选图、打开候选图对比、修订 prompt、继续迭代，直到达到停止条件。技能被读入本身就视为用户已经要求“生成候选图并迭代”，不得再把任务降级成纯文本提取。

禁止把本技能降级成“看图后直接给一条 style prompt”。只输出提示词而没有真实候选图、没有读图对比、没有迭代记录，视为未完成任务。

例外：如果当前任务是在维护/编辑本技能文件本身，而不是应用本技能处理参考图，则不要生成候选图。

## 目标

把“参考图 → 反推风格提示词 → 生成候选图 → 对比风格差距 → 修订提示词 → 再生成”的手动流程，变成可重复执行的闭环流程。

最终交付物不是某张具体图片，而是一条稳定可复用的“纯美术风格提示词”。这条提示词只能描述渲染、技法、线条、笔触、色彩、明暗、质感、完成度等美术语言，不绑定具体人物、场景、景别、日夜、世界观或剧情内容。

## 适用范围

当用户提供一张或多张美术参考图，并要求：

- 提取 / extract / distill / 萃取 / 蒸馏参考图的美术风格或画风。
- 反推出该图的美术风格提示词。
- 让生成图逐轮逼近参考图的画风。
- 建立项目级 `base` 风格基底。
- 按 `prompt_formula.yaml` 的层级写图像提示词。
- 比较两张图的画风差距并更新风格提示词。

如果用户的措辞是“distill / extract / 提取 / 萃取 / 蒸馏 / 反推 / 获得风格”，且上下文包含参考图或风格图，也必须触发本技能，并默认执行生成-对比-修订闭环，而不是只做文本分析。

不适用于：

- 复刻参考图的具体构图、人物、服装、场景或剧情。
- 角色一致性、服装一致性、世界观设定一致性。
- 单纯图片打分或审美评价。
- 未经用户提供参考图或明确风格图对象时，不凭空提交图片生成任务。

## 必读模板

执行前读取项目模板 ./prompt_formula.yaml

按该模板理解提示词层级：
```text
base + scene + light + mood + face + char + 构图 + qual + neg
```

本技能主要产出和修订 `base`，必要时可给出少量 `mood` / `neg` 建议；不要把参考图中的具体内容写进 `scene`、`char` 或构图层作为“风格”。

## 风格边界

### 可以进入风格提示词

- 媒介：digital painting, graphic novel illustration, watercolor, oil painting, ink wash, 3D render 等。
- 渲染：painterly, cel-shaded, semi-realistic, stylized, matte, soft blended shading, hard-edged shadow blocks 等。
- 线条：thick visible linework, loose sketch lines, clean vector lineart, broken contour lines, minimal outlines 等。
- 笔触：visible brushwork, dry brush texture, soft airbrush blending, impasto texture, hand-painted texture 等。
- 色彩：muted palette, high saturation, teal-orange contrast, pastel, earthy tones, limited palette 等。
- 明暗：high contrast, low contrast, graphic shadow shapes, soft ambient shading, chiaroscuro 等。
- 材质处理：matte surface treatment, rough paper grain, oil texture, comic halftone, film grain 等。
- 完成度：polished key visual, rough concept art, indie illustration, editorial illustration, manga cover finish 等。
- 稳定负面：not glossy plastic, not over-smoothed, no generic anime face, no flat vector colors 等。

### 不得进入风格提示词

- 具体主体：女孩、狗、旗袍、摩托、沙发、花、建筑、武器等。
- 身份设定：女杀手、飞行员、民国、异世界猎人、商会、组织名等。
- 景别构图：close-up, low angle, full body, centered composition, portrait orientation 等。
- 时间天气：daytime, night, sunset, rainy, snowy 等，除非作为抽象色彩/光影技法处理，不得绑定场景时间。
- 具体场景：street, bar, bedroom, sofa, Shanghai alley, cockpit 等。
- 具体动作与表情：sitting, running, looking at camera, smiling 等。
- 具体服装妆造：cheongsam, helmet, leather jacket, heels, earrings 等。
- 剧情氛围词：assassin, romance, battle, mystery story 等。

## 工作流程

### 1. 建立隔离测试内容

为避免模型把主体内容误当成风格，先选一个“中性测试内容”生成候选图。

推荐测试内容只承担载体功能，例如：

```text
simple standing character, plain background, neutral pose
```

或按用户当前项目选一个固定测试主体，但必须在每轮保持不变。测试主体不进入最终 `base`。

完成标准：参考图风格和测试主体被分离；后续对比只评估画风，不评估内容是否像参考图。

### 2. 从参考图反推初版 `base`

实际读图，先在心中识别以下纯美术维度：

1. 媒介类型。
2. 渲染方式。
3. 线条语言。
4. 笔触和纹理。
5. 明暗塑形。
6. 色彩系统。
7. 材质表面处理。
8. 细节密度和完成度。
9. 需要避免的常见偏差。

只把这些维度写入初版 `base` / `neg`。不要复述图中的人物、动物、场景、道具、景别、时间。

完成标准：初版 `base` 独立拿出来也能套到任意主体上，并且不泄漏参考图内容。

### 3. 按 `prompt_formula.yaml` 拼装生成提示词

使用模板层级拼装候选图提示词：

```text
base: <当前风格提示词>
scene: <固定中性测试内容需要的最少场景信息>
light: <中性光照，不从参考图抄具体时间>
mood: <只使用抽象调色词>
face/char/构图: <固定测试主体需要的最少内容>
qual: <模板质量词，可按风格减少 highly detailed>
neg: <当前避免项>
```

重要：`base` 要放在最前，权重最高；逐轮修订时优先改 `base` 和 `neg`，不要靠改主体内容骗过风格对比。

完成标准：生成提示词可直接提交给图片模型，且风格层与内容层可分离替换。

### 4. 生成候选图（强制步骤）

这是本技能的核心强制步骤。Codex / ChatGPT 只要读入本技能并正在处理参考图/风格图任务，就必须调用可用的图片生成工具，真实生成至少 1 张候选图，然后进入第 5 步对比。不能在第 2 或第 3 步后停止，不能只交付初版 `base`。

如果当前环境没有图片生成工具、工具报错、额度不足或参考图无法读取，必须直接报告阻塞原因，并给出已完成的初版 `base` 作为临时草稿；不得谎称已经生成、对比或迭代。

每轮保存：

```text
iteration: 轮次
style_prompt: 当前 base
negative_patch: 当前 neg
full_generation_prompt: 完整拼装提示词
candidate_image: 候选图路径或 URL
```

完成标准：候选图真实生成并可打开检查；产物记录里有候选图路径或 URL；不得用想象结果替代工具输出；不得把“建议下一步生成”当作完成。

### 5. 纯风格对比

对比参考图与候选图时，忽略以下差异：

- 主体是谁、数量、性别、年龄、服装、道具。
- 场景在哪里、室内室外、时代背景。
- 景别、构图、镜头角度、画幅比例。
- 日夜、天气、具体光源位置。
- 剧情、动作、表情、气氛叙事。

只评估以下差异：

```text
媒介是否一致
渲染方式是否一致
线条粗细/存在感是否一致
笔触纹理是否一致
色彩饱和度/色相倾向是否一致
明暗对比/阴影边界是否一致
材质表面是否一致
细节密度是否一致
画面完成度是否一致
是否出现参考图没有的模型默认味道
```

对比报告格式：

```yaml
iteration: 1
style_match_score: 0.72
matched:
  - 已接近的风格点
missing_or_weak:
  - 候选图缺少但参考图明显具备的风格点
excess_or_wrong:
  - 候选图多出来的错误风格点
prompt_update:
  add_to_base:
    - 需要新增或加强的短语
  remove_from_base:
    - 需要删除或减弱的短语
  add_to_neg:
    - 需要避免的错误倾向
stop: false
reason: 继续迭代的原因
```

完成标准：每条修订都能对应一个可见的风格差距，而不是泛泛地说“更高级”“更好看”。

### 6. 修订提示词

修订原则：

1. 一轮只解决最明显的 2-4 个风格偏差。
2. 优先增加精准风格词，少堆通用质量词。
3. 删除与目标风格冲突的旧词，不层层堆叠。
4. `neg` 只放反复出现的错误倾向，不塞无关禁词。
5. 保持 `base` 可迁移，不写入任何主体或场景。

完成标准：新版 `base` 比旧版更短或更准；没有内容词污染；能解释每处变化对应的视觉差距。

### 7. 停止条件

满足以下条件才停止：

- 连续一轮或两轮对比中，主要风格维度没有新增重大偏差。
- `style_match_score >= 0.88`，或模型判断“继续迭代只会带来微小收益”。
- 候选图与参考图在纯美术维度上已经一致：媒介、渲染、线条、笔触、色彩、明暗、材质、细节密度基本对齐。
- 最终 `base` 不包含具体内容、景别、时间、世界观、剧情词。

停止时输出：

```yaml
final_style_prompt:
  base: >
    ...
  neg: >
    ...
fit_notes:
  style_match_score: 0.91
  best_iteration: 4
  stable_traits:
    - ...
  remaining_minor_differences:
    - ...
usage_notes:
  - 将 base 放在 prompt_formula.yaml 的 base 层最前。
  - 具体主体、场景、光照、构图仍由下层逐图填写。
```

## 推荐自动化目录

如果用户要求落盘，按以下结构保存迭代记录：

```text
<style-workdir>/
  reference.png
  iterations.yaml
  iteration_01_prompt.txt
  iteration_01.png
  iteration_01_review.yaml
  iteration_02_prompt.txt
  iteration_02.png
  iteration_02_review.yaml
  final_style_prompt.yaml
```

`iterations.yaml` 记录每轮输入、输出、评分和修订原因，方便回滚到最佳版本。

## 常见错误

1. **把内容当风格。** 参考图里有摩托、狗、旗袍、沙发，不代表风格提示词要写这些内容。
2. **靠构图骗相似。** 候选图构图像参考图，不代表画风像；风格迭代应尽量固定中性测试主体。
3. **把日夜写死到 base。** 日夜属于 light 层；base 只能写抽象明暗技法。
4. **越改越长。** 风格词堆太多会互相抵消；每轮要删除冲突词。
5. **过度依赖质量词。** masterpiece、highly detailed 不能替代真实风格描述，还可能把图推向错误的精修默认风格。
6. **没有参考图也强行生图。** 只有当任务对象是参考图/风格图时，读入本技能才等同于用户要求生成候选图；维护技能文件本身或没有参考图对象时不要凭空生成。
7. **只给提示词不生成。** 当任务是让 Codex / ChatGPT 提取、extract、distill、萃取、反推参考图风格时，只输出初版 `base` 就结束是失败；必须先生成候选图，再对比迭代。
8. **只看整体好不好看。** 必须按媒介、渲染、线条、笔触、色彩、明暗、材质、细节密度逐项对比。

## 交付前检查

- [ ] 触发词 `distill` / `extract` / `提取` / `萃取` / `反推` 等已按本技能处理，而不是按普通看图提示词处理。
- [ ] 已读取 `prompt_formula.yaml`。
- [ ] 已实际查看参考图和候选图。
- [ ] 至少真实生成了 1 张候选图；若未生成，已明确报告工具阻塞原因。
- [ ] 没有只输出初版提示词就结束。
- [ ] 最终 `base` 只包含纯美术风格词。
- [ ] 没有主体、场景、服装、道具、景别、日夜、世界观、剧情词污染。
- [ ] 每轮修订都有可见风格差距依据。
- [ ] `neg` 只包含高频错误倾向，短而具体。
- [ ] 没有未经用户明确要求提交图片生成任务。
- [ ] 输出了最终 `base` / `neg` 和适用说明。
