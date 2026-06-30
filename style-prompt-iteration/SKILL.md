---
name: style-prompt-iteration
description: Codex/ChatGPT 专用的纯美术风格提取/萃取/蒸馏/迭代技能。用户说 distill style、extract style、style extraction、style distillation、提取美术风格、萃取画风、反推风格、获得风格提示词时触发；一旦读入并用于参考图任务，至少迭代2轮，每轮必须生成人物脸部特写、人物全身、纯环境、物品近景（有环境）4张候选图并逐张严格对比修订，尤其检查2D/3D混合、头发塑料高光、人体/肢体生命力和特殊风格化处理。
version: 1.0.9
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

把“参考图 → 反推风格提示词 → 生成候选图组 → 对比风格差距 → 修订提示词 → 再生成”的手动流程，变成可重复执行的闭环流程。

最终交付物不是某张具体图片，而是一条稳定可复用的“纯美术风格提示词”。这条提示词只能描述渲染、技法、线条、笔触、色彩、明暗、质感、完成度等美术语言，不绑定具体人物、场景、景别、日夜、世界观或剧情内容。

## 适用范围

当用户提供一张或多张美术参考图，并要求：

- 提取 / extract / distill / 萃取 / 蒸馏参考图的美术风格或画风。
- 反推出该图的美术风格提示词。
- 让生成图逐轮逼近参考图的画风。
- 建立项目级 `base` 风格基底。
- 按 `prompt_formula.md` 的层级写图像提示词。
- 比较两张图的画风差距并更新风格提示词。

如果用户的措辞是“distill / extract / 提取 / 萃取 / 蒸馏 / 反推 / 获得风格”，且上下文包含参考图或风格图，也必须触发本技能，并默认执行生成-对比-修订闭环，而不是只做文本分析。

不适用于：

- 复刻参考图的具体构图、人物、服装、场景或剧情。
- 角色一致性、服装一致性、世界观设定一致性。
- 单纯图片打分或审美评价。
- 未经用户提供参考图或明确风格图对象时，不凭空提交图片生成任务。

## 必读模板

执行前读取项目模板 `./style-prompt-iteration/prompt_formula.md`。

模板只提供拼装格式和例子，不承载解释、评论或流程规则；所有评论、引导、判断标准都以本技能为准。

按该模板理解提示词层级：
```text
[BASE_STYLE] + [CONTENT] + [LIGHT_COLOR] + [COMPOSITION] + [NEGATIVE]
```

本技能主要产出和修订 `[BASE_STYLE]`，必要时可给出少量 `[LIGHT_COLOR]` / `[NEGATIVE]` 建议；不要把参考图中的具体内容写进 `[CONTENT]` 或 `[COMPOSITION]` 作为“风格”。

## 风格边界

### 可以进入风格提示词

- 媒介：digital painting, graphic novel illustration, watercolor, oil painting, ink wash, 3D render 等。
- 渲染：painterly, cel-shaded, semi-realistic, stylized, matte, soft blended shading, hard-edged shadow blocks 等。
- 线条：thick visible linework, loose sketch lines, clean vector lineart, broken contour lines, minimal outlines 等。
- 笔触：visible brushwork, dry brush texture, soft airbrush blending, impasto texture, hand-painted texture 等。
- 色彩：muted palette, high saturation, teal-orange contrast, pastel, earthy tones, limited palette 等。
- 明暗：high contrast, low contrast, graphic shadow shapes, soft ambient shading, chiaroscuro 等。
- 材质处理：matte surface treatment, rough paper grain, oil texture, comic halftone, film grain 等。
- 完成度：clean controlled finish, rough concept art, indie illustration, editorial illustration, reference-matched finish 等。
- 稳定负面：not glossy plastic, not over-smoothed, no generic anime face, no flat vector colors 等。


### 禁用空泛精修词

不要在 `[BASE_STYLE]`、`[LIGHT_COLOR]`、`[COMPOSITION]` 或最终风格提示词中使用以下泛化精修词，除非用户原文明确要求逐字使用：

- `fashion magazine cover polish`
- `crisp manga-cover / fashion magazine finish`
- `fashion magazine finish`
- `manga-cover finish`
- `crisp manga-cover`

这些词太容易把结果推向过度精修、商业封面、头发高光过强、塑料感和通用二次元精修脸。需要描述完成度时，改用更可观察的具体风格词，例如：`clean controlled finish`, `reference-matched finish`, `controlled linework and shading`, `matte refined rendering`。


### `[NEGATIVE]` 只写真正负面失败项

能用正向提示词约束的内容，不要写进 `[NEGATIVE]`。负面词会强化模型对该对象/概念的注意，容易反向污染画面。

不要写：

- `not over-detailed background`
- `no detailed background`
- `not complex background`
- `not busy composition`
- `not copied outfit / copied props / copied hair color` 这类把不想要的内容反复点名的词

改成正向约束：

- `low-detail background`
- `simple background`
- `minimalistic background`
- `quiet uncluttered background`
- `clean empty negative space`
- `simple original outfit / original props / original hair color`（如果确实需要限制内容层）

`[NEGATIVE]` 只保留无法自然写成正向风格的高风险失败项，例如：`glossy plastic hair`, `wet specular hair`, `photorealistic skin`, `hard vector outlines`, `muddy colors`, `generic over-polished anime face`。如果某个问题可以通过 `[CONTENT]`、`[COMPOSITION]` 或 `[BASE_STYLE]` 正向写清楚，就不要放进 `[NEGATIVE]`。

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

### 1. 建立四类隔离测试内容

为避免模型把主体内容误当成风格，每轮必须生成 4 张不同测试图，用同一版 `[BASE_STYLE]` 检验风格能否迁移到不同内容：

1. **人物脸部特写**：检验脸部线条、五官渲染、肤色处理、局部细节密度。
2. **人物全身**：检验人体比例、体积、肌肉/肢体生命力、服装/形体的大色块、整体明暗和完成度；必须能暴露“身体变软、变纸片、变静态模特”的问题。
3. **纯环境**：检验没有人物时的色彩、笔触、空间材质和背景处理。
4. **物品近景（有环境）**：检验非人物主体的局部材质、边缘、笔触、明暗切面，以及物品与环境的统一程度，避免风格只在脸或人物上成立。

测试内容只承担载体功能，例如：

```text
face close-up of a neutral original character, plain background
full-body neutral original character with visible arms and legs, weight-bearing dynamic pose, simple background
simple empty environment, no people, readable space
close-up of a simple everyday object placed in a readable environment, no people
```

或按用户当前项目选固定测试主体/环境，但四类测试必须每轮都生成，且每轮保持同一测试集。测试主体不进入最终 `[BASE_STYLE]`。

完成标准：参考图风格和四类测试内容被分离；后续对比只评估画风，不评估内容是否像参考图。

### 2. 从参考图反推初版 `[BASE_STYLE]`

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

如果参考图存在 2D/3D 混合、3D 环境渲染、3D 手部/身体体积、镜头畸变、强景深、体积光粒子、局部线稿叠加等特殊处理，必须提取进 `[BASE_STYLE]`；遗漏这些特征视为提取失败。

只把这些维度写入初版 `[BASE_STYLE]` / `[NEGATIVE]`。不要复述图中的人物、动物、场景、道具、景别、时间。

### 人体/肢体生命力是独立风格维度

如果参考图的吸引力来自身体体积、肌肉张力、肢体受力、姿态能量或镜头下的形体透视，不得只把风格概括成“半写实二次元、柔和皮肤、清爽配色”。必须把这些可迁移的形体绘画语言作为风格指纹单独提取、测试和修订。

需要观察并记录：

1. **形体体积**：四肢是否有明确圆柱体/楔形体积，是否靠大明暗面塑造肌肉和骨点，而不是软塌的纸片身体。
2. **肌肉与皮肤平面**：肩、上臂、前臂、手腕、腹部、髋、腿部是否有简化但有力的肌肉转折、皮肤高光切面、半透明暖色反光。
3. **受力和姿态能量**：站姿/动作是否有重心、扭转、压缩与伸展，肢体线条是否带运动惯性和生命力，而不是静态模特站姿。
4. **镜头与比例风格**：是否存在近大远小、低机位、透视压缩/夸张导致的身体存在感；这属于风格化绘画语言，但最终 base 中只能写成抽象形体/透视处理，不能写具体景别。
5. **衣料服从身体**：服装褶皱是否围绕胸腔、腰胯、肢体受力产生大折面和拉扯线，而不是只画表面装饰褶皱。

修订时优先使用可迁移的风格短语，例如：`vital athletic body drafting`, `firm volumetric limb construction`, `simplified anatomical planes`, `skin planes shaped by crisp highlight cuts`, `clothing folds pulled by underlying body tension`, `dynamic weight-bearing pose language`。不要写成具体身材、性别、服装、运动项目或性感描述。

完成标准：初版 `[BASE_STYLE]` 独立拿出来也能套到任意主体上，并且不泄漏参考图内容。

### 3. 按 `prompt_formula.md` 拼装生成提示词

使用模板层级拼装候选图提示词：

```text
[BASE_STYLE]: <当前风格提示词>
[CONTENT]: <四类测试内容之一 + 必要空间/主体信息>
[LIGHT_COLOR]: <中性光照 + 抽象调色词，不从参考图抄具体时间>
[COMPOSITION]: <测试类型需要的最少构图>
[NEGATIVE]: <真正负面且无法自然正向表达的高风险失败项>
```

重要：`[BASE_STYLE]` 要放在最前，权重最高；逐轮修订时优先改 `[BASE_STYLE]` 和 `[NEGATIVE]`，不要靠改主体内容骗过风格对比。

完成标准：生成提示词可直接提交给图片模型，且风格层与内容层可分离替换。

### 4. 生成候选图（强制步骤）

这是本技能的核心强制步骤。Codex / ChatGPT 只要读入本技能并正在处理参考图/风格图任务，就必须调用可用的图片生成工具，至少完成 2 轮生图-对比-修订循环；每轮真实生成至少 4 张候选图：人物脸部特写、人物全身、纯环境、物品近景（有环境），然后进入第 5 步对比。不能只生成 1 张图后停止，不能只跑 1 轮后停止，不能在第 2 或第 3 步后停止，不能只交付初版 `[BASE_STYLE]`。

如果当前环境没有图片生成工具、工具报错、额度不足或参考图无法读取，必须直接报告阻塞原因，并给出已完成的初版 `[BASE_STYLE]` 作为临时草稿；不得谎称已经生成、对比或迭代。

每轮记录以下信息。默认在最终回复中报告；不要默认写入文件，除非用户明确要求落盘、保存到某个目录或更新某个项目文件：

```text
iteration: 轮次
style_prompt: 当前 [BASE_STYLE]
negative: 当前 [NEGATIVE]
test_set:
  face_closeup:
    full_generation_prompt: 完整拼装提示词
    candidate_image: 候选图路径或 URL
  full_body:
    full_generation_prompt: 完整拼装提示词
    candidate_image: 候选图路径或 URL
  environment:
    full_generation_prompt: 完整拼装提示词
    candidate_image: 候选图路径或 URL
  object_closeup_in_environment:
    full_generation_prompt: 完整拼装提示词
    candidate_image: 候选图路径或 URL
```

完成标准：4 张候选图都真实生成并可打开检查；产物记录里有 4 个候选图路径或 URL；不得用想象结果替代工具输出；不得把“建议下一步生成”当作完成。

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
人体/肢体生命力、形体体积、肌肉/皮肤平面是否一致（尤其 full_body）
细节密度是否一致
画面完成度是否一致
是否出现参考图没有的模型默认味道
```

每轮必须分别审查 4 张图，再给出整体结论。任何一张不合格，都必须继续迭代，不能宣布成功。即使第 1 轮 4 张图都看似合格，也必须用修订后的 `[BASE_STYLE]` 再生成第 2 轮 4 张图，复核风格一致性是否稳定。

对比报告格式：

```yaml
iteration: 1
tests:
  face_closeup:
    style_match_score: 0.72
    pass: false
    missing_or_weak: [候选图缺少但参考图明显具备的风格点]
    excess_or_wrong: [候选图多出来的错误风格点]
  full_body:
    style_match_score: 0.80
    pass: false
    missing_or_weak: []
    excess_or_wrong: []
  environment:
    style_match_score: 0.90
    pass: true
    missing_or_weak: []
    excess_or_wrong: []
  object_closeup_in_environment:
    style_match_score: 0.86
    pass: false
    missing_or_weak: []
    excess_or_wrong: []
overall_pass: false
prompt_update:
  add_to_base:
    - 需要新增或加强的短语
  remove_from_base:
    - 需要删除或减弱的短语
  add_to_neg:
    - 需要避免的错误倾向
stop: false
reason: 哪一类测试图仍不合格，为什么必须继续迭代
```

额外强制检查：`full_body` 不得只检查脸、头发和服装好不好看，必须检查人体/肢体生命力是否匹配参考图。若全身图出现软弱纸片身体、无肌肉切面、无重心、无肢体张力、衣褶不服从身体体积，即使脸和配色接近，也必须判失败并继续迭代。

完成标准：每条修订都能对应一个可见的风格差距，而不是泛泛地说“更高级”“更好看”。

### 6. 修订提示词

修订原则：

1. 一轮只解决最明显的 2-4 个风格偏差。
2. 优先增加精准风格词，少堆通用质量词。
3. 删除与目标风格冲突的旧词，不层层堆叠。
4. `[NEGATIVE]` 只放真正负面且反复出现的风格失败项；凡是能用正向提示词约束的内容，必须改写到 `[BASE_STYLE]`、`[CONTENT]`、`[LIGHT_COLOR]` 或 `[COMPOSITION]`，不要写成 negative。
5. 保持 `base` 可迁移，不写入任何主体或场景。

完成标准：新版 `base` 比旧版更短或更准；没有内容词污染；能解释每处变化对应的视觉差距。

### 7. 停止条件

满足以下条件才停止：

- 至少完成 2 轮迭代；每轮都包含人物脸部特写、人物全身、纯环境、物品近景（有环境）4 张候选图。
- 同一轮的 4 张测试图全部通过：人物脸部特写、人物全身、纯环境、物品近景（有环境）。
- 每张测试图的 `style_match_score >= 0.9`，且没有重大风格偏差。
- 4 张候选图都与参考图在纯美术维度上基本一致：媒介、渲染、线条、笔触、色彩、明暗、材质、细节密度基本对齐。
- 人物全身候选图的人体/肢体生命力、形体体积、肌肉/皮肤平面、衣料受力必须对齐参考图；这是硬性通过项，不得被脸部或配色分数抵消。
- 哪怕只有 1 张测试图不符合，或只完成了 1 轮迭代，也必须继续迭代，不能确认风格提示词成功。
- 最终 `[BASE_STYLE]` 不包含具体内容、景别、时间、世界观、剧情词。

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
  - 将 [BASE_STYLE] 放在 prompt_formula.md 的最前。
  - 具体主体、场景、光照、构图仍由下层逐图填写。
```

默认只把最终风格提示词和必要迭代摘要输出在对话里。不要自动创建 `final_style_prompt.yaml`、不要自动修改项目 prompt 文件、不要自动写入 README/设定文档；只有用户明确要求“保存/写入/落盘/更新文件/放到某路径”时，才写文件。

## 可选自动化目录

只有用户明确要求落盘时，才按以下结构保存迭代记录：

```text
<style-workdir>/
  reference.png
  iterations.yaml
  iteration_01_prompt.txt
  iteration_01_face_closeup.png
  iteration_01_full_body.png
  iteration_01_environment.png
  iteration_01_object_closeup_in_environment.png
  iteration_01_review.yaml
  iteration_02_prompt.txt
  iteration_02_face_closeup.png
  iteration_02_full_body.png
  iteration_02_environment.png
  iteration_02_object_closeup_in_environment.png
  iteration_02_review.yaml
  final_style_prompt.yaml
```

`iterations.yaml` 记录每轮输入、输出、评分和修订原因，方便回滚到最佳版本。未获用户明确落盘要求时，不创建这些文件。

## 常见错误

1. **把内容当风格。** 参考图里有摩托、狗、旗袍、沙发，不代表风格提示词要写这些内容。
2. **靠构图骗相似。** 候选图构图像参考图，不代表画风像；风格迭代应尽量固定中性测试主体。
3. **把日夜写死到 base。** 日夜属于 light 层；base 只能写抽象明暗技法。
4. **越改越长。** 风格词堆太多会互相抵消；每轮要删除冲突词。
5. **过度依赖质量词。** masterpiece、highly detailed 不能替代真实风格描述，还可能把图推向错误的精修默认风格。
6. **没有参考图也强行生图。** 只有当任务对象是参考图/风格图时，读入本技能才等同于用户要求生成候选图；维护技能文件本身或没有参考图对象时不要凭空生成。
7. **只给提示词不生成。** 当任务是让 Codex / ChatGPT 提取、extract、distill、萃取、反推参考图风格时，只输出初版 `[BASE_STYLE]` 就结束是失败；必须先生成候选图组，再对比迭代。
8. **只生成一张图就停止。** 单张图可能偶然接近；必须每轮生成人物脸部特写、人物全身、纯环境、物品近景（有环境）4 张图，四张都合格才停止。
9. **只迭代一轮就停止。** 第 1 轮即使分数很高也不能停止；至少跑第 2 轮，用新 prompt 再生成 4 张图复核稳定性。
10. **使用空泛商业封面精修词。** 不要把本技能列出的禁用精修词写进 `[BASE_STYLE]`、`[LIGHT_COLOR]`、`[COMPOSITION]` 或最终风格提示词；它们会诱导过度高光和塑料感。
11. **滥用 negative prompt。** 不要写 `not over-detailed background` 这类可正向约束的问题；应改成 `low-detail background` / `simple background` / `minimalistic background` 等正向表达。
12. **默认写文件。** 确认最终风格提示词后，默认只在对话中输出；没有用户明确要求时，不写 `final_style_prompt.yaml`，不更新项目文件。
13. **只看整体好不好看。** 必须按媒介、渲染、线条、笔触、色彩、明暗、材质、细节密度逐项对比。

## 交付前检查

- [ ] 触发词 `distill` / `extract` / `提取` / `萃取` / `反推` 等已按本技能处理，而不是按普通看图提示词处理。
- [ ] 已读取 `prompt_formula.md`。
- [ ] 已实际查看参考图和 4 张候选图。
- [ ] 至少完成 2 轮迭代；第 1 轮不能作为最终停止轮。
- [ ] 每轮至少真实生成了 4 张候选图：人物脸部特写、人物全身、纯环境、物品近景（有环境）；若未生成，已明确报告工具阻塞原因。
- [ ] 4 张候选图全部通过纯美术风格一致性检查；任一不通过则继续迭代。
- [ ] 没有只输出初版提示词就结束。
- [ ] 最终 `[BASE_STYLE]` 只包含纯美术风格词。
- [ ] 没有主体、场景、服装、道具、景别、日夜、世界观、剧情词污染。
- [ ] 没有使用本技能列出的禁用空泛商业封面精修词。
- [ ] 没有把可用正向提示词约束的问题写进 `[NEGATIVE]`；例如不要写 `not over-detailed background`，应写 `low-detail/simple/minimalistic background`。
- [ ] 每轮修订都有可见风格差距依据。
- [ ] `neg` 只包含高频错误倾向，短而具体。
- [ ] 没有未经用户明确要求提交图片生成任务。
- [ ] 没有未经用户明确要求写入最终风格提示词文件或修改项目文档。
- [ ] 输出了最终 `[BASE_STYLE]` / `[NEGATIVE]` 和适用说明。
