---
name: style-prompt-iteration
description: Codex/ChatGPT 专用的纯美术风格提取/萃取/蒸馏/迭代并产出新风格生成技能的技能。用户说 distill style、extract style、style extraction、style distillation、提取美术风格、萃取画风、反推风格、获得风格提示词、生成风格技能时触发；一旦读入并用于参考图任务，第一步必须先判定大类媒介（纯2D、纯3D渲染、2.5D、2D+3D混合、真实摄影），不得默认归为2.5D或2D；之后至少迭代2轮，每轮必须生成人物脸部特写、人物全身、纯环境、物品近景（有环境）4张主体锚点候选图，并生成一组材质/纹理锚点图，逐张严格对比修订，最终产出一个可复用的新 skill 文件夹，内含按主体类型和材质类型路由的 reference 图和对应 base_style。
version: 1.2.0
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

最终交付物不是某张具体图片，也不是一条低信息量“纯美术风格提示词”，而是一个可复用的新风格生成 skill 文件夹。这个新 skill 用迭代得到的 4 类主体 reference 图和一组材质/纹理 reference 图作为视觉锚点，并用 router 按用户要生成的主体类型与材质类型选择对应 reference 和 `base_style.md`，避免把人物皮肤、头发等不适用于环境/物品的词塞进通用 base。

最终仍可包含一个短的共享风格提示词，但它只能作为 `shared_style_invariants.md` 的一部分；真正用于生成时，必须由新 skill 组合：

```text
shared_style_invariants.md + references/<subject_route>_base_style.md + references/materials/<material_route>_base_style.md + 用户内容需求
```

## 适用范围

当用户提供一张或多张美术参考图，并要求：

- 提取 / extract / distill / 萃取 / 蒸馏参考图的美术风格或画风。
- 反推出该图的美术风格提示词。
- 让生成图逐轮逼近参考图的画风。
- 建立项目级 `base` 风格基底。
- 生成一个专门复用该参考图美术风格的新 Codex skill。
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

### 必须提取“风格指纹”，不能只提取制作管线

媒介和渲染技术只是风格的底座，不等于完整画风。尤其是纯 3D 渲染参考图，`3D render / PBR / SSS / strand hair / ray-traced light / depth of field` 只能保证结果像 CG，不能保证像同一个美术风格。初版 `[BASE_STYLE]` 必须同时包含以下可迁移的风格指纹；缺任一类都要在迭代中补齐：

- **形状语言**：脸部、五官、身体、物件轮廓是偏圆润、硬朗、纤细、厚重、简化还是复杂；转折是大块面还是碎细节。
- **比例理想化方式**：是否有游戏角色式理想化五官、清晰但不过度写实的解剖、压低真实瑕疵、强化眼唇轮廓、收敛骨点等；只能写抽象比例处理，不能写具体性别、年龄或角色身份。
- **边缘层级**：哪些区域锐利，哪些区域软化；是否有柔焦背景、清晰面部焦点、柔和发丝边缘、干净接触边缘。
- **明暗语法**：大光面与暗面的比例、阴影边界软硬、皮肤高光形状、环境反光强弱、是否依赖局部高光切面塑形。
- **材质细节频率**：皮肤孔隙、布纹、发丝、金属划痕、木纹等细节是克制、均匀、大片简化还是微细高频；不要只写 `highly detailed`。
- **色彩配比**：主色、辅助色、点缀色的关系，整体饱和度和黑位，是否有选择性暖红/玫瑰色点缀、冷暖中和、低饱和土色等。
- **镜头和后期质感**：是否像游戏过场的预渲染镜头、真实镜头 DOF、轻微胶片式 rolloff、干净无噪的 CG 后期，或摄影式高 ISO 噪声。
- **角色/物体的美术完成度边界**：是通用真实 CG、商业广告 CG、游戏过场角色、收藏手办、影视 VFX、还是插画化 3D；必须避免只写成泛化“高端 3D”。

完成标准：把 `[BASE_STYLE]` 中的媒介/管线词全部删掉后，剩余词仍能描述一个可识别的画风；把具体主体换成环境或物品时，仍能约束色彩、明暗、边缘、材质细节频率和完成度。

### 单张参考图必须区分三类信息

从单张图蒸馏风格时，先把观察结果拆成三类，再写 prompt：

1. **可迁移风格不变量**：换主体、换场景仍应保留的美术语言，例如理想化真实比例、柔和皮肤块面、低饱和土色、受控高光、清晰材质分离、预渲染游戏 CG 完成度。
2. **条件性风格变量**：只在同类主体上成立的处理，例如人脸 SSS、发丝束状、皮革微光、皮肤高光切面。迁移到环境和物品时要改写成对应材质语言，不能原样堆到所有图里。
3. **不可迁移内容特征**：具体人、服装、发型、场景、景别、动作、时间、道具、民族/时代符号等，不得进入 `[BASE_STYLE]`。

如果候选图只继承了第 2 类制作细节，却没有继承第 1 类风格不变量，应判为失败。例如参考图是理想化游戏 CG 少女脸，候选图变成写实武术道场男性角色；即使同样有 PBR、SSS、毛发、体积光，也不能认为是同一美术风格。

记录格式：

```yaml
style_signal_split:
  transferable_invariants:
    - ...
  conditional_style_variables:
    - ...
  non_transferable_content:
    - ...
  missing_risk_if_only_pipeline_words:
    - ...
```


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

### 1. 先判定大类媒介（最高优先级）

看参考图后，第一件事不是写 `semi-real`、`2.5D`、`digital painting`，而是先给出大类媒介判定。必须在以下五类中选择一个主类，并写出证据：

1. **纯 2D**：明显手绘/平面插画；线稿、笔触、色块、纸面/画布纹理主导；没有真实 3D 几何体积、PBR 材质或摄影镜头痕迹。
2. **纯 3D 渲染**：CG/游戏/Octane/Unreal/Blender/ZBrush/KeyShot 等渲染感主导；有真实三维几何体积、PBR/SSS 皮肤、毛发系统、镜头景深、接触阴影、环境反射、金属/玻璃/布料/蕾丝等材质响应；可以是 stylized 3D，但主媒介仍是 3D render。
3. **2.5D**：平面插画为主，但用较强体积光影、软面塑形或伪 3D 质感增强；缺少稳定的 3D 几何、材质物理、真实镜头/渲染管线证据。
4. **2D + 3D 混合**：画面中有明确 2D 手绘/线稿/笔触层，也有明确 3D 模型/环境/材质层；必须指出哪些部分是 2D，哪些部分是 3D。
5. **真实摄影**：真实相机拍摄的人/物/场景为主；有真实传感器/镜头噪声、真实皮肤瑕疵、真实物理材质和非 CG 的自然不完美。

大类判定是硬门槛：如果主类判错，后续所有风格 prompt 和生成图都视为失败。尤其禁止把纯 3D 渲染默认写成 `2.5D digital painting`、`semi-real digital painting`、`anime digital painting` 或 `soft anatomical planes`。这些词会把结果推向平面绘画，不能替代 3D 渲染证据。

判定格式必须先输出/记录：

```yaml
macro_medium:
  primary_category: pure_3d_render | pure_2d | 2_5d | 2d_3d_hybrid | realistic_photography
  confidence: 0.0-1.0
  evidence:
    skin: ...
    hair: ...
    fabric_or_materials: ...
    lighting_and_shadows: ...
    camera_depth_edges: ...
  forbidden_defaults_if_wrong:
    - semi-real 2.5D digital painting
    - anime digital painting
    - painterly 2D illustration
```

当判定为 **纯 3D 渲染** 时，`[BASE_STYLE]` 必须以 3D 渲染语言开头，例如 `stylized high-end 3D character render`, `PBR material response`, `subsurface-scattering skin`, `strand-based hair`, `ray-traced / cinematic CG lighting`, `depth of field`, `physically plausible fabric, metal, glass, lace`。负面词中必须明确排除错误媒介：`2D illustration, digital painting, painterly brushwork, cel shading, lineart, flat anime rendering, 2.5D look`。

当判定为 **纯 2D** 时，才使用插画/笔触/线稿/色块语言；不得写 3D render / PBR / SSS / ray-traced。

当判定为 **2.5D** 时，必须说明为什么不是纯 3D，也不是纯 2D；不要把所有半写实图都粗暴归为 2.5D。

当判定为 **2D + 3D 混合** 时，`[BASE_STYLE]` 必须分别描述 2D 层和 3D 层，不得把混合风格压平成一种“2.5D”。

当判定为 **真实摄影** 时，必须优先使用摄影语言；不得用 3D/2D 词替代真实镜头与现实材质证据。

完成标准：在进入测试图生成前，已经有明确的大类媒介、证据、禁止误用词；`[BASE_STYLE]` 的第一个短语必须与大类媒介一致。

### 2. 建立四类隔离测试内容

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

### 3. 从参考图反推初版 `[BASE_STYLE]`

实际读图，并基于第 1 步的大类媒介判定，识别以下纯美术维度：

1. 媒介类型。
2. 渲染方式。
3. 线条语言。
4. 笔触和纹理。
5. 明暗塑形。
6. 色彩系统。
7. 材质表面处理。
8. 细节密度和完成度。
9. 需要避免的常见偏差。
10. 风格指纹：形状语言、比例理想化方式、边缘层级、明暗语法、材质细节频率、色彩配比、镜头后期、完成度边界。

如果参考图存在纯 3D 渲染、2D/3D 混合、3D 环境渲染、3D 手部/身体体积、镜头畸变、强景深、体积光粒子、局部线稿叠加等特殊处理，必须提取进 `[BASE_STYLE]`；遗漏这些特征视为提取失败。对纯 3D 参考图，必须保留 3D render / CG / PBR / SSS / strand hair / DOF / material response 等媒介证据，不得改写成 2.5D 或 digital painting。

在写初版 `[BASE_STYLE]` 前，必须先输出/记录 `style_signal_split`。如果只写出 `PBR / SSS / strand hair / ray-traced light / high-end 3D render` 这类制作管线词，而没有写形状语言、比例理想化、边缘层级、明暗语法、材质细节频率和色彩配比，视为风格蒸馏不完整。

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

### 4. 按 `prompt_formula.md` 拼装生成提示词

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

### 5. 生成候选图（强制步骤）

这是本技能的核心强制步骤。Codex / ChatGPT 只要读入本技能并正在处理参考图/风格图任务，就必须调用可用的图片生成工具，至少完成 2 轮生图-对比-修订循环；每轮真实生成至少 4 张候选图：人物脸部特写、人物全身、纯环境、物品近景（有环境），然后进入第 6 步对比。不能只生成 1 张图后停止，不能只跑 1 轮后停止，不能在第 3 或第 4 步后停止，不能只交付初版 `[BASE_STYLE]`。

如果当前环境没有图片生成工具、工具报错、额度不足或参考图无法读取，必须直接报告阻塞原因，并给出已完成的初版 `[BASE_STYLE]` 作为临时草稿；不得谎称已经生成、对比或迭代。

每轮记录以下信息。默认在最终回复中报告；不要默认写入文件，除非用户明确要求落盘、保存到某个目录或更新某个项目文件：

```text
iteration: 轮次
style_prompt: 当前 [BASE_STYLE]
negative: 当前 [NEGATIVE]
macro_medium: 当前大类媒介判定
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

### 5.5. 选定新 skill 的 4 张 reference 锚点图

迭代结束前，必须从候选图中选出 4 张作为新风格生成 skill 的核心 references：

1. `face.png`：人脸 / 头像 / 半身特写风格锚点。
2. `full_body.png`：人物全身 / 角色立绘 / 动作人物风格锚点。
3. `environment.png`：无人环境 / 室内外空间 / 建筑风格锚点。
4. `object.png`：物品 / 道具 / 产品 / 材质近景风格锚点。

每张 reference 必须对应一个同名 `*_base_style.md`，只描述该主体类型适用的风格语言：

- `face_base_style.md` 可以写皮肤、五官、眼唇、发丝、面部边缘、脸部材质细节频率。
- `full_body_base_style.md` 可以写人体比例、形体体积、姿态受力、衣料服从身体、全身材质分区。
- `environment_base_style.md` 只能写空间、建筑/自然材质、背景色块、光影层级、空间边缘和环境细节频率；不得写皮肤、头发、五官。
- `object_base_style.md` 只能写物品轮廓、材质、边缘、反射折射、细节密度、放置环境统一性；不得写人体、皮肤、头发、五官。

完成标准：4 张 reference 图都来自真实迭代产出，且每个 `*_base_style.md` 都是按主体类型裁剪过的高信息风格描述，不是从同一个通用 base 复制粘贴。

### 5.6. 生成并选定材质/纹理 reference 锚点图

4 张主体锚点只能覆盖“生成什么类型的图”，不能充分约束“这个风格如何处理不同材质”。因此最终新 skill 必须包含一组材质/纹理 references，用来补足 PBR、粗糙度、反射折射、纹理频率、边缘高光、磨损程度和风格化程度。

默认至少生成并保留以下材质锚点；如果参考图明显包含额外材质，应追加：

1. `skin.png` / `skin_base_style.md`：皮肤、SSS、毛孔密度、皮肤高光、暖冷反光。
2. `hair.png` / `hair_base_style.md`：发丝、发束、毛发片层、各向异性高光、飞散发控制。
3. `fabric.png` / `fabric_base_style.md`：布料、织物、纤维频率、褶皱大面、透光/哑光程度。
4. `leather.png` / `leather_base_style.md`：皮革、漆皮、磨砂皮、边缘磨损、油蜡高光。
5. `metal.png` / `metal_base_style.md`：金属、粗糙度、边缘高光、划痕、镀层、旧化。
6. `glass.png` / `glass_base_style.md`：玻璃、水晶、透明度、折射、焦散感、边缘亮线。
7. `plastic.png` / `plastic_base_style.md`：塑料、树脂、涂层、次表面透光、避免廉价塑料感。
8. `wood.png` / `wood_base_style.md`：木材、木纹频率、抛光/粗糙、边缘磨损。
9. `stone.png` / `stone_base_style.md`：石头、岩面、雕塑块面、粗糙纹理、裂纹密度。
10. `ceramic.png` / `ceramic_base_style.md`：陶瓷、釉面、瓷面高光、裂釉、边缘厚度。
11. `paper.png` / `paper_base_style.md`：纸张、卡纸、羊皮纸、纤维、印刷/压纹。
12. `liquid.png` / `liquid_base_style.md`：水、油、透明液体、湿润边缘、反射折射。
13. `emissive.png` / `emissive_base_style.md`：发光材质、霓虹、魔法/能量表面、辉光边界。
14. `rubber.png` / `rubber_base_style.md`：橡胶、哑光弹性表面、软边、低反射。

材质图应是中性材质样本或简单材质球/材质块，不得做成复杂道具、角色或场景。每张材质图要用同一版共享风格不变量和该材质专用 prompt 生成，保证它们是同一风格系统下的材质参考。

每个材质 `*_base_style.md` 必须只写该材质的可迁移风格处理，例如：

- 反射/粗糙度范围。
- 纹理频率和细节密度。
- 边缘高光和暗部处理。
- 磨损、裂纹、纤维、划痕、气泡等微细节是否克制。
- 与整体色彩系统的关系。

完成标准：材质锚点图都真实生成并可打开检查；材质说明不能复制主体 base；后续新 skill 可按“主体 route + 材质 route”组合读取。

### 5.7. 产出新风格生成 skill 文件夹

默认最终必须落盘一个新 skill 文件夹，不能只在对话中输出提示词。除非用户明确要求只看草稿，否则本技能的完成产物是一个可被后续调用的 Codex skill。

新 skill 的目录结构固定如下：

```text
<generated-style-skill>/
  SKILL.md
  references/
    source_01.png
    source_02.png
    source_03.png
    shared_style_invariants.md
    router.md
    face.png
    face_base_style.md
    full_body.png
    full_body_base_style.md
    environment.png
    environment_base_style.md
    object.png
    object_base_style.md
    materials/
      skin.png
      skin_base_style.md
      hair.png
      hair_base_style.md
      fabric.png
      fabric_base_style.md
      leather.png
      leather_base_style.md
      metal.png
      metal_base_style.md
      glass.png
      glass_base_style.md
      plastic.png
      plastic_base_style.md
      wood.png
      wood_base_style.md
      stone.png
      stone_base_style.md
      ceramic.png
      ceramic_base_style.md
      paper.png
      paper_base_style.md
      liquid.png
      liquid_base_style.md
      emissive.png
      emissive_base_style.md
      rubber.png
      rubber_base_style.md
    negative_prompt.md
    generation_formula.md
```

不要创建 `examples/` 目录；不要创建单独 `specs/` 目录；不要把 reference 图和示例图分成两套。`references/` 既保存原始参考图，也保存迭代产出的 4 张主体风格锚点图、材质/纹理锚点图和它们的文本说明。

新 skill 的 `SKILL.md` 必须保持简短，只做三件事：

1. 说明这个 skill 用于按指定参考图美术风格生成新图。
2. 指示先读取 `references/router.md` 判断用户目标属于哪个主体 route 和哪些材质 route。
3. 指示只读取相关主体 reference、相关材质 reference 与对应 `*_base_style.md`，再读取 `shared_style_invariants.md`、`negative_prompt.md`、`generation_formula.md`。

新 skill 的 `router.md` 必须按主体类型和材质类型组合路由：

```yaml
subject_routes:
  face:
    when: 人脸、头像、半身特写、面部表情、妆容、发型为主要目标
    read:
      - shared_style_invariants.md
      - face_base_style.md
      - face.png
      - negative_prompt.md
      - generation_formula.md
  full_body:
    when: 人物全身、角色立绘、动作人物、服装造型为主要目标
    read:
      - shared_style_invariants.md
      - full_body_base_style.md
      - full_body.png
      - negative_prompt.md
      - generation_formula.md
  environment:
    when: 无人场景、建筑、室内、室外、空间氛围为主要目标
    read:
      - shared_style_invariants.md
      - environment_base_style.md
      - environment.png
      - negative_prompt.md
      - generation_formula.md
  object:
    when: 物品、道具、产品、材质近景为主要目标
    read:
      - shared_style_invariants.md
      - object_base_style.md
      - object.png
      - negative_prompt.md
      - generation_formula.md
  mixed:
    when: 同时包含人物、环境、物体且都重要
    read: 只读取实际涉及主体类型对应的 base_style 和 reference，不要默认全读
material_routes:
  skin:
    when: 皮肤、面部、手部、人体可见肌肤
    read: [materials/skin_base_style.md, materials/skin.png]
  hair:
    when: 头发、毛发、绒毛、动物毛
    read: [materials/hair_base_style.md, materials/hair.png]
  fabric:
    when: 布料、服装、织物、窗帘、软装
    read: [materials/fabric_base_style.md, materials/fabric.png]
  leather:
    when: 皮革、漆皮、皮带、皮包、皮质服装
    read: [materials/leather_base_style.md, materials/leather.png]
  metal:
    when: 金属、首饰、盔甲、机械、刀剑、五金
    read: [materials/metal_base_style.md, materials/metal.png]
  glass:
    when: 玻璃、水晶、镜片、透明容器、宝石类透明折射
    read: [materials/glass_base_style.md, materials/glass.png]
  plastic:
    when: 塑料、树脂、涂层、合成材料
    read: [materials/plastic_base_style.md, materials/plastic.png]
  wood:
    when: 木头、木家具、木地板、树干、木制道具
    read: [materials/wood_base_style.md, materials/wood.png]
  stone:
    when: 石头、岩壁、雕塑、混凝土、砖石
    read: [materials/stone_base_style.md, materials/stone.png]
  ceramic:
    when: 陶瓷、瓷器、釉面器皿、瓷砖
    read: [materials/ceramic_base_style.md, materials/ceramic.png]
  paper:
    when: 纸张、书页、卡纸、包装、卷轴
    read: [materials/paper_base_style.md, materials/paper.png]
  liquid:
    when: 水、油、饮料、透明液体、湿润表面
    read: [materials/liquid_base_style.md, materials/liquid.png]
  emissive:
    when: 发光材质、霓虹、能量、屏幕、魔法辉光
    read: [materials/emissive_base_style.md, materials/emissive.png]
  rubber:
    when: 橡胶、哑光软质合成表面、轮胎、密封件
    read: [materials/rubber_base_style.md, materials/rubber.png]
```

如果用户目标是无人环境，新 skill 不得读取 `face_base_style.md` 或 `full_body_base_style.md`；如果用户目标是物品，不得读取人物风格文件；如果用户目标是人脸，不得读取环境/物品风格文件，除非用户明确要求复杂场景或道具。材质 route 则按画面实际材质叠加读取，例如玻璃香水瓶读取 `object` + `glass` + `metal`，石头神庙读取 `environment` + `stone`，角色全身皮革盔甲读取 `full_body` + `leather` + `metal` + 必要的 `skin` / `hair`。

### 6. 纯风格对比

对比参考图与候选图时，忽略以下差异：

- 主体是谁、数量、性别、年龄、服装、道具。
- 场景在哪里、室内室外、时代背景。
- 景别、构图、镜头角度、画幅比例。
- 日夜、天气、具体光源位置。
- 剧情、动作、表情、气氛叙事。

只评估以下差异：

```text
大类媒介是否一致（纯2D / 纯3D渲染 / 2.5D / 2D+3D混合 / 真实摄影）
若目标是纯3D渲染，是否具备CG几何体积、PBR/SSS材质、毛发系统、真实镜头/DOF/接触阴影；是否错误变成2D/2.5D/digital painting
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
  macro_medium_gate:
    target: pure_3d_render | pure_2d | 2_5d | 2d_3d_hybrid | realistic_photography
    candidate_category: ...
    pass: false
    reason: 大类媒介是否判错，例如纯3D参考图被生成成2.5D插画
  style_fingerprint_gate:
    pass: false
    reason: 是否只继承了制作管线而没有继承形状语言、比例理想化、边缘层级、明暗语法、材质细节频率和色彩配比
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

额外强制检查：先检查 `macro_medium_gate`。如果参考图是纯 3D 渲染，而候选图变成 2.5D、2D digital painting、painterly illustration、cel/anime illustration，则直接失败，不再用脸、配色、服装细节补分。

额外强制检查：再检查 `style_fingerprint_gate`。如果候选图媒介正确，但只是通用高端 CG、通用写实摄影感、广告级 3D、影视 VFX 或模型默认美型，没有保留参考图的比例理想化方式、边缘层级、色彩配比、细节频率和明暗语法，也必须判失败。不能用“PBR/SSS/毛发/体积光都对了”抵消风格指纹缺失。

额外强制检查：`full_body` 不得只检查脸、头发和服装好不好看，必须检查人体/肢体生命力是否匹配参考图。若全身图出现软弱纸片身体、无肌肉切面、无重心、无肢体张力、衣褶不服从身体体积，即使脸和配色接近，也必须判失败并继续迭代。

完成标准：每条修订都能对应一个可见的风格差距，而不是泛泛地说“更高级”“更好看”。

### 7. 修订提示词

修订原则：

1. 一轮只解决最明显的 2-4 个风格偏差。
2. 优先增加精准风格词，少堆通用质量词。
3. 删除与目标风格冲突的旧词，不层层堆叠。
4. 如果大类媒介判错，先改媒介词，不要先修脸、配色、服装。纯 3D 目标必须删除 `2.5D`, `digital painting`, `painterly`, `illustration`, `linework`, `brushwork`, `cel shading` 等冲突词；加入 3D/CG/PBR/SSS/strand hair/DOF/material response 等正向证据。
5. 如果大类媒介正确但风格不像，先补风格指纹，不要继续堆制作管线词。优先修订形状语言、比例理想化、边缘层级、明暗语法、材质细节频率和色彩配比。
6. `[NEGATIVE]` 只放真正负面且反复出现的风格失败项；凡是能用正向提示词约束的内容，必须改写到 `[BASE_STYLE]`、`[CONTENT]`、`[LIGHT_COLOR]` 或 `[COMPOSITION]`，不要写成 negative。
7. 保持 `base` 可迁移，不写入任何主体或场景。

完成标准：新版 `base` 比旧版更短或更准；没有内容词污染；能解释每处变化对应的视觉差距。

### 8. 停止条件

满足以下条件才停止：

- 至少完成 2 轮迭代；每轮都包含人物脸部特写、人物全身、纯环境、物品近景（有环境）4 张候选图。
- 同一轮的 4 张测试图全部通过：人物脸部特写、人物全身、纯环境、物品近景（有环境）。
- 大类媒介门槛通过：候选图必须与参考图同属纯2D、纯3D渲染、2.5D、2D+3D混合或真实摄影中的同一主类；主类错误时不得停止。
- 风格指纹门槛通过：候选图不能只是同媒介、同管线或同质量等级；必须在形状语言、比例理想化、边缘层级、明暗语法、材质细节频率、色彩配比和完成度边界上与参考图一致。
- 每张测试图的 `style_match_score >= 0.9`，且没有重大风格偏差。
- 4 张候选图都与参考图在纯美术维度上基本一致：媒介、渲染、线条、笔触、色彩、明暗、材质、细节密度基本对齐。
- 人物全身候选图的人体/肢体生命力、形体体积、肌肉/皮肤平面、衣料受力必须对齐参考图；这是硬性通过项，不得被脸部或配色分数抵消。
- 哪怕只有 1 张测试图不符合，或只完成了 1 轮迭代，也必须继续迭代，不能确认风格提示词成功。
- 最终 `[BASE_STYLE]` 不包含具体内容、景别、时间、世界观、剧情词。
- 已选定 4 张 reference 锚点图：`face.png`、`full_body.png`、`environment.png`、`object.png`。
- 已为 4 张 reference 分别写出 `face_base_style.md`、`full_body_base_style.md`、`environment_base_style.md`、`object_base_style.md`，且每个文件只包含该主体类型适用的风格信息。
- 已生成默认材质/纹理 reference 锚点图和对应 `materials/*_base_style.md`：skin、hair、fabric、leather、metal、glass、plastic、wood、stone、ceramic、paper、liquid、emissive、rubber；如参考图包含额外关键材质，也已追加。
- 已生成新 skill 文件夹，包含 `SKILL.md`、`references/shared_style_invariants.md`、`references/router.md`、4 张主体 reference 图、4 个对应主体 `*_base_style.md`、`references/materials/` 材质 reference 图和材质 `*_base_style.md`、`negative_prompt.md`、`generation_formula.md`。
- 新 skill 的 router 能避免跨主体污染，并能按材质叠加读取：无人环境不读人物文件，物品不读人物文件，人脸不读环境/物品文件；材质文件只按画面实际材质读取。

停止时输出：

```yaml
generated_style_skill:
  path: ...
  skill_name: ...
  files:
    - SKILL.md
    - references/shared_style_invariants.md
    - references/router.md
    - references/face.png
    - references/face_base_style.md
    - references/full_body.png
    - references/full_body_base_style.md
    - references/environment.png
    - references/environment_base_style.md
    - references/object.png
    - references/object_base_style.md
    - references/materials/skin.png
    - references/materials/skin_base_style.md
    - references/materials/hair.png
    - references/materials/hair_base_style.md
    - references/materials/fabric.png
    - references/materials/fabric_base_style.md
    - references/materials/leather.png
    - references/materials/leather_base_style.md
    - references/materials/metal.png
    - references/materials/metal_base_style.md
    - references/materials/glass.png
    - references/materials/glass_base_style.md
    - references/materials/plastic.png
    - references/materials/plastic_base_style.md
    - references/materials/wood.png
    - references/materials/wood_base_style.md
    - references/materials/stone.png
    - references/materials/stone_base_style.md
    - references/materials/ceramic.png
    - references/materials/ceramic_base_style.md
    - references/materials/paper.png
    - references/materials/paper_base_style.md
    - references/materials/liquid.png
    - references/materials/liquid_base_style.md
    - references/materials/emissive.png
    - references/materials/emissive_base_style.md
    - references/materials/rubber.png
    - references/materials/rubber_base_style.md
    - references/negative_prompt.md
    - references/generation_formula.md
  router_summary:
    face: ...
    full_body: ...
    environment: ...
    object: ...
    materials: ...
fit_notes:
  macro_medium: pure_3d_render | pure_2d | 2_5d | 2d_3d_hybrid | realistic_photography
  style_match_score: 0.91
  best_iteration: 4
  stable_traits:
    - ...
  remaining_minor_differences:
    - ...
usage_notes:
  - 后续生成新图时调用该新 skill。
  - 新 skill 会先按用户目标选择 face / full_body / environment / object / mixed 主体 route。
  - 新 skill 再按画面实际材质选择 skin / hair / fabric / leather / metal / glass / plastic / wood / stone / ceramic / paper / liquid / emissive / rubber 等材质 route。
  - 不要把所有主体 route 或材质 route 的 base_style 合并成一个通用 prompt。
```

默认必须创建新 skill 文件夹并报告路径。不要自动创建 README、CHANGELOG、INSTALLATION_GUIDE 等额外文档；新 skill 只保留 `SKILL.md` 和 `references/` 下的必要文件。

## 新 skill 产物目录

产物目录固定为一个新 skill。默认在当前 `.art-skills` workspace 下创建，名称使用小写字母、数字和连字符，例如 `<style-name>-style-generator/`。如果用户给了明确名称，按用户名称规范化为 hyphen-case。

```text
<style-name>-style-generator/
  SKILL.md
  references/
    source_01.png
    source_02.png
    source_03.png
    shared_style_invariants.md
    router.md
    face.png
    face_base_style.md
    full_body.png
    full_body_base_style.md
    environment.png
    environment_base_style.md
    object.png
    object_base_style.md
    materials/
      skin.png
      skin_base_style.md
      hair.png
      hair_base_style.md
      fabric.png
      fabric_base_style.md
      leather.png
      leather_base_style.md
      metal.png
      metal_base_style.md
      glass.png
      glass_base_style.md
      plastic.png
      plastic_base_style.md
      wood.png
      wood_base_style.md
      stone.png
      stone_base_style.md
      ceramic.png
      ceramic_base_style.md
      paper.png
      paper_base_style.md
      liquid.png
      liquid_base_style.md
      emissive.png
      emissive_base_style.md
      rubber.png
      rubber_base_style.md
    negative_prompt.md
    generation_formula.md
```

如果需要保留迭代过程，可以把迭代记录写入 `references/iteration_notes.md`，但不要默认创建 `iterations.yaml`、`iteration_01_prompt.txt` 这类过程文件。新 skill 的核心是可复用的主体路由 + 材质路由 reference 包，不是完整实验日志。

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
12. **只交付低信息 prompt。** 单条 `[BASE_STYLE]` 太容易丢失参考风格；最终必须产出新 skill 文件夹，并包含 4 类 reference 图和对应 `*_base_style.md`。
13. **只看整体好不好看。** 必须按媒介、渲染、线条、笔触、色彩、明暗、材质、细节密度逐项对比。
14. **默认归为 2.5D。** 看到半写实人物就写 `semi-real 2.5D digital painting` 是严重错误。必须先区分纯2D、纯3D渲染、2.5D、2D+3D混合、真实摄影；参考图是纯3D时，任何 2.5D/2D/digital painting 候选都应直接判失败。
15. **把 references 和 examples 做成两套。** 新 skill 只需要 `references/`；迭代产出的 4 张锚点图就是后续生成的 reference，不要再创建重复的 `examples/` 目录。
16. **创建单独 specs 目录。** 不要创建 `specs/`；共享不变量写入 `references/shared_style_invariants.md`，各主体类型风格写入 `references/*_base_style.md`。
17. **让所有任务读取所有风格文件。** 新 skill 必须先 route；生成环境时不要读取人脸/全身风格文件，生成物品时不要读取人物风格文件。
18. **只增加主体锚点，不做材质锚点。** 更多人脸/全身/环境/物体图不能替代材质参考；必须生成材质/纹理锚点来约束木头、石头、金属、玻璃、塑料、皮肤、布料等跨内容迁移。
19. **把材质词塞进通用 base。** 金属、玻璃、皮肤、木头等应进入 `references/materials/*_base_style.md`，由 router 按画面实际材质读取，不要全部写进 `shared_style_invariants.md`。

## 交付前检查

- [ ] 触发词 `distill` / `extract` / `提取` / `萃取` / `反推` 等已按本技能处理，而不是按普通看图提示词处理。
- [ ] 已读取 `prompt_formula.md`。
- [ ] 已先判定大类媒介：纯2D、纯3D渲染、2.5D、2D+3D混合、真实摄影；没有默认写成 2.5D 或 2D。
- [ ] 已拆分 `style_signal_split`：可迁移风格不变量、条件性风格变量、不可迁移内容特征。
- [ ] `[BASE_STYLE]` 不只是制作管线词；已包含形状语言、比例理想化、边缘层级、明暗语法、材质细节频率、色彩配比、镜头后期和完成度边界。
- [ ] 如果目标是纯3D渲染，`[BASE_STYLE]` 使用 3D/CG/PBR/SSS/strand hair/DOF/material response 语言，且 `[NEGATIVE]` 排除了 2D illustration / digital painting / painterly / lineart / cel shading / 2.5D look。
- [ ] 已实际查看参考图和 4 张候选图。
- [ ] 至少完成 2 轮迭代；第 1 轮不能作为最终停止轮。
- [ ] 每轮至少真实生成了 4 张候选图：人物脸部特写、人物全身、纯环境、物品近景（有环境）；若未生成，已明确报告工具阻塞原因。
- [ ] 4 张候选图全部通过纯美术风格一致性检查；任一不通过则继续迭代。
- [ ] 没有只输出初版提示词或最终单条 prompt 就结束。
- [ ] 已创建新风格生成 skill 文件夹，而不是只在对话中贴提示词。
- [ ] 新 skill 含 `SKILL.md` 和 `references/`，没有重复的 `examples/` 或单独 `specs/`。
- [ ] `references/` 中有原始参考图、`shared_style_invariants.md`、`router.md`、4 张锚点 reference 图、4 个对应 `*_base_style.md`、`negative_prompt.md`、`generation_formula.md`。
- [ ] `references/materials/` 中有默认材质/纹理锚点和对应 `*_base_style.md`：skin、hair、fabric、leather、metal、glass、plastic、wood、stone、ceramic、paper、liquid、emissive、rubber；参考图特有关键材质已追加。
- [ ] 每个 `*_base_style.md` 只包含该主体类型适用的风格信息；环境/物品文件没有皮肤、头发、五官等人物专属词。
- [ ] 每个 `materials/*_base_style.md` 只包含该材质适用的反射/粗糙度、纹理频率、边缘高光、磨损细节和色彩关系。
- [ ] 新 skill 的 `router.md` 会根据用户目标只读取相关主体类型的 reference 和 base_style，并根据画面实际材质追加读取相关 material reference 和 material base_style。
- [ ] 最终 `[BASE_STYLE]` 只包含纯美术风格词。
- [ ] 没有主体、场景、服装、道具、景别、日夜、世界观、剧情词污染。
- [ ] 没有使用本技能列出的禁用空泛商业封面精修词。
- [ ] 没有把可用正向提示词约束的问题写进 `[NEGATIVE]`；例如不要写 `not over-detailed background`，应写 `low-detail/simple/minimalistic background`。
- [ ] 每轮修订都有可见风格差距依据。
- [ ] 大类媒介错误时已先修正媒介词，而不是用脸、配色、细节继续补分。
- [ ] 大类媒介正确但不像同一画风时，已优先修正风格指纹，而不是继续堆 `PBR / SSS / ray-traced / high-end render`。
- [ ] `neg` 只包含高频错误倾向，短而具体。
- [ ] 没有未经用户明确要求提交图片生成任务。
- [ ] 没有创建 README、CHANGELOG、INSTALLATION_GUIDE 等无关文档。
- [ ] 输出了新 skill 路径、文件清单、router 摘要和必要适用说明。
