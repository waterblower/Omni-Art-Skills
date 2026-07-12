---
name: style-prompt-iteration
description: Codex/ChatGPT 专用的纯美术风格获取、提取、萃取、蒸馏和迭代技能。用户说 get style、distill style、extract style、style extraction、style distillation、获取风格、提取风格、萃取画风、反推风格等任何中英文类似意图时触发完整 pipeline：先判定参考图媒介大类（纯2D、纯3D渲染、2.5D、2D+3D混合、真实摄影），再真实生成候选图、读图对比、自我修正，至少完成2轮4类验证图迭代，并独立并发生成16张材质/纹理锚点图，最终产出可复用的新风格 skill 文件夹。禁止只输出提示词或只生成 prompt 文件。
version: 1.4.4
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [image-style, prompt-iteration, art-direction, image-generation, style-matching, style-extraction, style-distillation, get-style, extract-style, distill-style]
    aliases: [get-style, get-style-prompt, style-get, style-extract, style-distill, art-style-extraction, art-style-distillation, extract-style-prompt, distill-style-prompt, 获取风格, 获得风格, 获取画风, 获得画风, 提取风格, 提取美术风格, 萃取画风, 蒸馏风格, 反推风格, 获得风格提示词]
    related_skills: [image-art-direction]
---

# 纯美术风格提示词迭代

## 0. 不可跳过的执行规则

当用户要求获取、提取、萃取、蒸馏、反推参考图风格，且上下文包含参考图/风格图时，本技能必须进入完整图片迭代模式。触发词包括但不限于：

- English: `get style`, `get the style`, `get style prompt`, `get art style`, `extract style`, `distill style`, `style extraction`, `style distillation`, `derive style`, `reverse style`, `create style skill`, `make style skill`, `style from reference`.
- 中文：`获取风格`、`获得风格`、`获取画风`、`获得画风`、`提取风格`、`提取美术风格`、`萃取画风`、`蒸馏风格`、`反推风格`、`获得风格提示词`、`从参考图获得风格`、`生成风格技能`。

`get style` 不是轻量触发词，不允许只生成 prompt 文件；它等同于要求执行完整 pipeline：

1. 读取 `./style-prompt-iteration/prompt_formula.md`。
2. 查看参考图并判定大类媒介。
3. 写初版 `[BASE_STYLE]`、`[LIGHT_COLOR]`、`[NEGATIVE]`。
4. 调用图片生成工具，至少完成 2 轮：每轮 4 张候选图。
5. 打开候选图逐张对比，修订 prompt，再生成下一轮。
6. 生成并检查 16 张独立材质/纹理锚点图。
7. 落盘一个新风格生成 skill 文件夹。

禁止只输出提示词、只做文字分析、只生成 1 张图、只跑 1 轮、把“建议下一步生成”当作完成。若没有图片生成工具、工具失败、额度不足或参考图不可读，必须明确报告阻塞，并只把初版 prompt 标为临时草稿。

路径写法硬约束：任何记录、日志、YAML、Markdown、最终回复和新 skill 文件中，只能写相对路径；禁止写全局/绝对路径，例如 `/Users/...`、`/private/...`、`C:\...`、`file://...`。已生成文件也必须用相对路径引用。

例外：如果当前任务是在维护/编辑本技能文件本身，不要生成候选图。

## 1. Prompt 公式

按 [prompt_formula.md](prompt_formula.md) 拼装：

```text
[BASE_STYLE]
[CONTENT]
[LIGHT_COLOR]
[COMPOSITION]
[NEGATIVE]
```

本技能主要修订 `[BASE_STYLE]`，但必须显式写 `[LIGHT_COLOR]` 的柔和光照约束和 `[NEGATIVE]` 的过曝/油亮失败项。不得把参考图具体人物、服装、道具、场景、景别、时间、剧情写进 `[BASE_STYLE]`。

## 2. 大类媒介判定

第一步必须从五类中选择一个主类，并写证据：

- `pure_2d`：手绘/平面插画、线稿、笔触、色块、纸面/画布纹理主导；无稳定 3D 几何、PBR、摄影镜头证据。
- `pure_3d_render`：CG/游戏/Octane/Unreal/Blender/ZBrush/KeyShot 等渲染感主导；有三维几何体积、PBR/SSS、毛发系统、景深、接触阴影、环境反射、材质响应。
- `2_5d`：平面插画为主，但用强体积光影、软面塑形或伪 3D 质感增强；缺少真实 3D 管线证据。
- `2d_3d_hybrid`：明确同时存在 2D 手绘/线稿/笔触层和 3D 模型/环境/材质层。
- `realistic_photography`：真实相机拍摄；真实传感器/镜头噪声、真实皮肤瑕疵、现实材质和自然不完美。

记录格式：

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

大类判错时后续全部失败。纯 3D 不得写成 2.5D / digital painting / anime illustration；纯 2D 不得写 PBR / SSS / ray-traced；混合风格必须分别描述 2D 层和 3D 层。

### 2.1 纯 2D 与 2.5D 的强制辨别

不得因为参考图“看起来像动画/插画”就默认判为 `pure_2d`。尤其要区分以下两种表面语言：

- `pure_2d` 水粉、纸本、画册式插画：可见纸纹/画布纹理、干刷、破碎笔触、综合色块或线稿主导，体积主要由明确色块或可见笔触构成。
- `2_5d` 平滑精修数字插画：即使没有真实 3D 管线，也可能具有低笔触可见度、平滑渐变、软面塑形、局部精准高光、清楚的材质分区和接近渲染图的体积完整性。

若参考图表面干净、皮肤与衣料过渡平滑、金属/皮革高光精确、几乎没有纸纹或干刷证据，应优先考虑 `2_5d`，不得仅凭“手绘感”写成 `pure_2d`、`gouache`、`paper grain` 或 `storybook painting`。

必须额外记录：

```yaml
surface_language:
  visible_brushwork: low | medium | high
  paper_or_canvas_grain: absent | subtle | dominant
  global_noise_or_speckle: absent | subtle | dominant
  texture_distribution: none | localized | global
  texture_evidence_regions: []
  value_transition: flat_blocks | softened_blocks | smooth_gradients
  material_separation: weak | moderate | precise
  highlight_design: diffuse | painted_selective | render_like_precise
  likely_failure_if_misread: ...
```

如果这些证据相互冲突，降低媒介置信度，并用第一轮候选专门验证“平滑精修 2.5D”与“纸本/水粉纯 2D”的差异；不得在未验证前锁定带强媒介偏向的词。

### 2.2 纹理与噪点默认禁入

不得把 `pure_2d`、水粉、纸本、复古画册或手绘感自动翻译为全画面颗粒。`grain`、`paper grain`、`film grain`、`noise`、`speckle`、`stippling`、`screenprint dots`、`chalk dust`、`scumble` 等会产生高频噪点的词默认禁止进入 `[BASE_STYLE]`、`[LIGHT_COLOR]`、材质 prompt 和生成公式。

只有参考图中能明确指出至少两个实际区域，并确认颗粒是稳定的媒介特征而非压缩伪影、缩放锯齿、截图噪声或纸张扫描脏点时，才允许加入对应纹理词。即使允许，也必须同时限定：纹理出现在哪些对象/区域、覆盖比例、颗粒尺度、密度和强度；默认使用 `localized`, `sparse`, `low-density`, `large-scale broken brush texture`，禁止 `all-over`, `uniform`, `fine-grain overlay`, `dense speckle`。

参考图未见明确颗粒证据时，必须正向写入 `clean broad color fields`, `quiet smooth midtone areas`, `no added texture overlay`，并在 `[NEGATIVE]` 加入 `film grain`, `digital noise`, `uniform paper grain`, `dense speckle`, `all-over stippling`, `texture overlay`, `compression-like artifacts`。真实摄影只有在参考照片本身存在可辨识且风格化的胶片颗粒时例外。

## 3. 风格提取边界

### 必须进入风格 prompt

- 媒介、渲染、线条、笔触/纹理、色彩、明暗、材质处理、完成度。
- 风格指纹：形状语言、比例理想化方式、边缘层级、明暗语法、材质细节频率、色彩配比、镜头后期、完成度边界。
- 人体/肢体生命力：形体体积、肌肉/皮肤平面、重心、姿态受力、衣料服从身体、透视下的形体存在感。

### 必须排除内容污染

不得把具体主体、身份、服装、道具、场景、动作、表情、景别、时间、天气、世界观、剧情写入 `[BASE_STYLE]`。这些只能进入 `[CONTENT]` 或 `[COMPOSITION]`。

### 单张参考图拆分

写初版 prompt 前记录：

```yaml
style_signal_split:
  transferable_invariants:
    - 可跨主体迁移的美术语言
  conditional_style_variables:
    - 只适用于人脸、头发、皮革、金属等局部材质/主体的处理
  non_transferable_content:
    - 具体人物、服装、场景、构图、道具等内容特征
  missing_risk_if_only_pipeline_words:
    - 只写 PBR / SSS / high-end render 会丢失的风格指纹
```

把 `[BASE_STYLE]` 中媒介/管线词删掉后，剩余词仍必须能描述可识别画风。

### 风格相似不等于题材相似

以下因素只能作为内容或弱辅助信号，不能证明风格匹配：

- 相同的蓝绿、土黄、棕色配色。
- 相同的幻想旅行者、盔甲、皮带、刀剑、草原、远山、蓝天白云等题材。
- 相同的性别、发色、服装时代、世界观或构图氛围。
- 都显得“高质量”“精致”“像动画”或“像概念设计”。

即使题材与配色高度相似，只要表面语言、人物造型、明暗语法、材质响应、边缘层级或细节频率明显不同，就必须判为风格失败。不得用内容相似抵消纯美术风格偏差。

### 细节必须服务结构，禁止伪高细节

“高细节”不是在过渡区域铺满小纹样、草叶、花朵、褶皱、挂件、划痕或装饰线。必须区分：

- `structural_detail`：解释形体转折、受力、材料构造、功能连接、焦点叙事或空间层次的细节；它会随尺度、遮挡、受光和材质而变化。
- `filler_detail`：没有结构或叙事作用、在相近尺度上机械重复的花纹、植被、饰件、笔触或噪点；它只是把过渡区域填满，制造“看似高细节”。

在 `[BASE_STYLE]` 中必须记录参考图的细节预算与留白：焦点区域可以精细，但中间层和背景须保留安静的大形、清晰节奏和可呼吸的负空间。不得把“精致”“复杂”“rich detail”“intricate”“ornate”当作无条件质量词；只有参考图确有对应证据时才能使用，并必须限定其位置、尺度和功能。

对人物服饰，纹样、缝线、扣件和褶皱必须服从衣料裁片、关节、受力与视线焦点；不能在每一块布料上均匀铺装饰。对植被，先建立地形大块、疏密节奏和远近层次，再在少量近景焦点添加物种可辨识细节；不得以重复草叶、雏菊、灌木团或同一笔触纹样填满坡地。

## 4. 全局光照质量门槛

无论媒介是 2D、2.5D、3D、混合还是真实摄影，都必须避开以下失败光照：

- 过曝皮肤、过曝白衣、亮斑冲白、亮部无色彩层次。
- 不自然镜面反射、湿油感、塑料感、油膜感、廉价 glossy 高光。
- 点光源热点、硬闪光、小光斑、星点泛滥、粒子/高光污染。
- 过强 rim light、过硬 specular streak、不受控白线高光。
- 雨水、汗水、湿身、玻璃、金属、皮革等材质被渲染成油腻脏亮。

默认追求：

- `soft global illumination`, `broad area light`, `large diffused light source`, `controlled specular rolloff`, `preserved highlight color detail`。
- 3D/摄影：area lights / softboxes / bounced light，而不是 point lights / hard flash / tiny hotspot。
- 2D/2.5D/绘画：大面积色块、柔和笔触、低噪声明暗过渡、受控局部提亮，而不是碎亮点、油亮线、高频闪烁反光。

`[LIGHT_COLOR]` 必须包含柔和全局光、大面积面光源、受控高光。`[NEGATIVE]` 必须包含：`overexposed highlights`, `blown-out whites`, `oily wet shine`, `greasy specular reflections`, `point-light hotspots`, `sparkle pollution`, `harsh flash lighting`, `uncontrolled glossy reflections`。参考图没有明确颗粒证据时，还必须包含：`film grain`, `digital noise`, `uniform paper grain`, `dense speckle`, `all-over stippling`, `texture overlay`, `compression-like artifacts`。这些是稳定失败防线，不受“少写 negative”的一般原则限制。

候选图只要出现过曝/油亮/热点/闪点污染，即使其他风格维度接近，也必须失败并继续修订。

## 5. 禁用词和 negative 原则

不要使用以下空泛精修词，除非用户原文要求逐字使用：

- `fashion magazine cover polish`
- `crisp manga-cover / fashion magazine finish`
- `fashion magazine finish`
- `manga-cover finish`
- `crisp manga-cover`

`[NEGATIVE]` 只写真正负面失败项。能正向表达的内容不要写 negative，例如用 `simple background` / `low-detail background` 替代 `not over-detailed background`。例外是第 4 节的过曝/油亮/热点稳定负面项。

## 6. 两轮四图迭代

每轮必须生成 4 张独立候选图，使用同一版风格 prompt，测试风格跨内容迁移：

1. `face_closeup`：人脸 / 头像 / 半身特写；检验脸部、五官、皮肤、头发、局部细节频率。
2. `full_body`：人物全身；检验比例、形体体积、肢体生命力、姿态受力、衣料服从身体。
3. `environment`：无人环境；检验空间、建筑/自然材质、背景色块、光影层级。
4. `object_closeup_in_environment`：物品近景（有环境）；检验非人物材质、边缘、反射、环境统一性。

测试内容是载体，不进入 `[BASE_STYLE]`。可用中性内容：

```text
face close-up of a neutral original character, plain background
full-body neutral original character with visible arms and legs, weight-bearing dynamic pose, simple background
simple empty environment, no people, readable space
close-up of a simple everyday object placed in a readable environment, no people
```

生成记录格式：

```yaml
iteration: 1
macro_medium: ...
style_prompt: 当前 [BASE_STYLE]
light_color: 当前 [LIGHT_COLOR]
negative: 当前 [NEGATIVE]
test_set:
  face_closeup: {full_generation_prompt: ..., candidate_image: ...}
  full_body: {full_generation_prompt: ..., candidate_image: ...}
  environment: {full_generation_prompt: ..., candidate_image: ...}
  object_closeup_in_environment: {full_generation_prompt: ..., candidate_image: ...}
```

## 7. 对比与修订

每轮必须打开 4 张候选图逐张检查。忽略具体主体、服装、道具、场景、构图、日夜、动作、剧情；只评估纯美术风格。

对比时必须先做一次“去内容化检查”：在心里忽略人物身份、服装、道具、草原、天空和主色，只比较以下六个独立维度。每个维度都要写证据，不能只给总分：

1. `surface_language`：平滑或粗糙；纸纹、画布纹、干刷和笔触的可见度。
2. `character_shape_language`：年龄感、五官比例、眼鼻口简化方式、下颌与身体比例的理想化方式。
3. `value_and_edge_grammar`：渐变或色块、软硬边分布、轮廓是否封闭、焦点边缘是否更清楚。
4. `material_response`：皮肤、头发、布、皮革、金属是否具有参考图相同的高光宽度、粗糙度和材质分离。
5. `detail_frequency`：细节集中于焦点还是平均铺满全画面；背景是否与参考图同样简化。
6. `color_structure`：不只比较色相，还要比较明度范围、饱和度、冷暖分配、空气透视和亮部是否通透。

另做一次 100% 尺寸的 `noise_overlay_check`：检查天空、皮肤、墙面、衣料中间调和其他大色块。若候选出现参考图没有的均匀细点、砂纸感、扫描脏点、胶片颗粒或压缩噪声膜，必须失败；缩略图看似柔和不能抵消原尺寸的噪点问题。

还必须检查 `detail_integrity`：逐区确认细节是否解释结构，而非用重复模式冒充完成度。重点检查人物服装的花纹/褶皱/挂件，以及植被、石块、云层等背景过渡区。出现以下任何一项都必须记录为失败：

- 过渡区域被同尺度的花纹、扣件、草叶、花朵或装饰线平均填满，导致没有安静的中间层。
- 同一种微小纹样或笔触连续重复，改变位置却不改变尺度、方向、遮挡、受光或功能。
- 服饰装饰不跟随裁片、缝合线、褶皱与受力；植被细节不服从地形、景深与景别。
- 背景的高频细节与主体争夺注意力，或远景仍保有近景同等的细节密度。

评估时问三个问题：删去这处细节后形体、材质、功能或焦点会不会受损？它是否随对象结构而变化？它是否只在应当精细的位置出现？三个答案若均为否，即为 `filler_detail`，不得以“复杂、精致、丰富”评分加分。

特别警惕以下伪匹配：参考图是平滑、低纹理、精确材质分区的 2.5D 精修插画，而候选图只是用了相近配色与幻想题材，却呈现纸张颗粒、干刷水粉、复古画册、成熟写实骨相或平均铺陈的繁复细节。此类候选即使“很好看”，`style_fingerprint_gate` 也必须失败，建议总分不得高于 `0.6`。

硬门槛：

- `macro_medium_gate`：候选图主媒介必须与参考图一致。
- `style_fingerprint_gate`：不能只是同媒介/同管线/同质量；必须匹配形状语言、比例理想化、边缘层级、明暗语法、材质细节频率、色彩配比、完成度边界。
- `surface_language_gate`：可见笔触、纸/画布纹理、平滑度、渐变方式必须匹配；参考图低纹理时，候选不得擅自加入明显水粉、干刷、旧纸或粗画布质感。
- `noise_overlay_gate`：候选不得出现参考图没有的全局颗粒、均匀噪点、砂纸膜、胶片颗粒或压缩伪影；参考图确有颗粒时，候选的区域、覆盖率、尺度、密度和强度也必须匹配。
- `character_design_gate`：人物测试必须匹配参考图的年龄感、动画化程度、五官简化与身体比例；“都是漂亮人物”不算通过。
- `material_response_gate`：至少分别检查皮肤、头发、布料、皮革/金属；候选不得把参考图清楚区分的材质统一处理成同一种干燥或油亮表面。
- `detail_distribution_gate`：焦点与背景的细节分配必须匹配；不得用全画面繁复细节替代参考图的选择性精细与安静背景。
- `detail_integrity_gate`：每一类高频细节都必须服务结构、材料、受力、空间或焦点；服饰花纹和背景植被不得以单一重复模式填充过渡区域、伪造高细节。
- `lighting_quality_gate`：不得过曝、油亮、点光源热点、硬闪光、星点污染、不受控 glossy 高光。
- `full_body_life_gate`：全身图必须有形体体积、肌肉/皮肤平面、重心、肢体张力、衣料受力；脸和配色接近不能抵消身体失败。

全身图与参考图景别不同时，必须使用 `face_closeup` 校验人脸与表面语言，再使用 `full_body` 校验人体和服装；不得只凭全身图与参考图共享天空、服装或色调便判定通过。环境和物品测试也不得反向掩盖人物风格失败。

报告格式：

```yaml
iteration: 1
tests:
  macro_medium_gate: {pass: false, reason: ...}
  style_fingerprint_gate: {pass: false, reason: ...}
  surface_language_gate: {pass: false, reason: ...}
  noise_overlay_gate: {pass: false, reason: ...}
  character_design_gate: {pass: false, reason: ...}
  material_response_gate: {pass: false, reason: ...}
  detail_distribution_gate: {pass: false, reason: ...}
  detail_integrity_gate: {pass: false, reason: ...}
  lighting_quality_gate: {pass: false, reason: ...}
  face_closeup: {style_match_score: 0.72, pass: false, missing_or_weak: [], excess_or_wrong: []}
  full_body: {style_match_score: 0.80, pass: false, missing_or_weak: [], excess_or_wrong: []}
  environment: {style_match_score: 0.90, pass: true, missing_or_weak: [], excess_or_wrong: []}
  object_closeup_in_environment: {style_match_score: 0.86, pass: false, missing_or_weak: [], excess_or_wrong: []}
overall_pass: false
prompt_update:
  add_to_base: []
  remove_from_base: []
  update_light_color: []
  add_to_neg: []
stop: false
```

修订原则：一轮只解决最明显的 2-4 个偏差；优先精准风格词，少堆质量词；删除冲突词。媒介错先修媒介；媒介对但不像先补风格指纹；过曝/油亮/热点先修 `[LIGHT_COLOR]` 并保留光照 negative。

如果候选被错误推向水粉/旧画册质感，而参考图实际平滑精修，必须删除或否定冲突词，例如 `gouache`、`paper grain`、`canvas texture`、`dry brush`、`storybook painting`、`vintage illustration`、`visible brushwork`，并明确补入 `smooth digitally painted surfaces`、`low visible brush texture`、`soft airbrushed planar modeling`、`precise material separation`、`selective crisp highlights`。反之亦然：参考图确有纸本和笔触证据时，不得用平滑 2.5D 词抹掉它们。

如果候选出现参考图没有的噪点膜，先删除所有会诱发颗粒的媒介词及近义词，不得只靠 negative 抵消；再加入 `clean broad color fields`, `quiet smooth midtone areas`, `no added texture overlay`。只有参考图确有局部纹理证据时，才改写为带区域和密度约束的局部纹理描述。

如果候选出现伪高细节，修订时优先删除笼统的细节加码词与内容噪声词，例如 `intricate patterns everywhere`、`rich ornamental details`、`dense foliage`、`many accessories`、`highly detailed background`、`abundant flowers`。改为按焦点和结构正向约束，例如 `selective structural detail at focal seams and functional joints`、`quiet broad midtone areas between focal details`、`sparse vegetation grouped by terrain and depth`、`simplified distant foliage masses`、`ornament limited to functional borders`。必要时在 `[NEGATIVE]` 增加 `repetitive filler detail`, `uniform ornamental patterning`, `dense repetitive foliage`, `busy transition areas`, `detail noise`。

停止条件：

- 至少完成 2 轮，每轮 4 张图。
- 当前轮 4 张图全部通过所有硬门槛，且每张 `style_match_score >= 0.9`。
- 任一图失败或只完成 1 轮，必须继续迭代。

## 8. 16 张材质/纹理锚点

最终新 skill 必须包含 16 张默认材质/纹理 reference，每个材质是一个独立图片生成任务。工具支持并发时应并发提交 16 个独立请求；如果不支持并发则顺序生成。禁止 4x4 宫格、contact sheet、atlas、sprite sheet、大图合集、先生成大图再 crop。每张图必须有独立 prompt、独立输出路径/URL、独立检查记录。

默认材质：

```text
skin, hair, fabric, leather, metal, glass, plastic, wood,
stone, ceramic, paper, liquid, emissive, rubber, makeup, foliage
```

材质图应是中性材质样本、材质球或简单材质块，不得做成复杂道具、角色或场景。每个 `materials/*_base_style.md` 只写该材质的反射/粗糙度、纹理频率、边缘高光、磨损/裂纹/纤维/气泡等微细节、与整体色彩系统的关系。

材质锚点同样执行 `noise_overlay_gate`。不得为了表现粗糙度而给所有材质叠加同一种纸纹、砂砾或颗粒膜；粗糙度必须通过该材质自身的结构性纹理、边缘响应和明暗变化表达。只有参考图明确存在统一媒介颗粒时，才允许按其真实分布加入。

## 9. 最终新 skill 产物

必须创建全新的 skill 文件夹，落盘位置按以下优先级确定：

1. 用户明确指定输出路径时，写到该路径下。
2. 用户未指定输出路径时，写到当前 agent 的 working directory（`pwd`）下。

文件夹名称必须使用 hyphen-case，例如 `<style-name>-style-generator`。创建前必须检查目标路径是否已经存在；禁止覆盖、合并、清空、删除、重命名或复用任何已有文件夹。若候选名称已存在，必须改用一个从未存在的新名称，例如依次尝试 `<style-name>-style-generator-2`、`<style-name>-style-generator-3`，直到找到未占用名称，再创建并写入。即使已有文件夹看起来是旧版本、空目录或本次任务的同类产物，也不得写入其中；始终使用新名称（always a new name）。

除创建这个全新产物文件夹外，不得修改输出位置中的任何已有文件或文件夹。不要只在对话中贴 prompt。不要创建 `examples/`、`specs/`、README、CHANGELOG、INSTALLATION_GUIDE。

目录结构：

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
      makeup.png
      makeup_base_style.md
      foliage.png
      foliage_base_style.md
    negative_prompt.md
    generation_formula.md
```

4 张主体 reference 必须来自真实迭代产出：

- `face_base_style.md`：只写脸、皮肤、五官、发丝、面部边缘、脸部细节频率。
- `full_body_base_style.md`：只写人体比例、形体体积、姿态受力、衣料服从身体、全身材质分区。
- `environment_base_style.md`：只写空间、建筑/自然材质、背景色块、光影层级、环境细节频率；不得写皮肤/头发/五官。
- `object_base_style.md`：只写物品轮廓、材质、边缘、反射折射、细节密度、放置环境统一性；不得写人体/皮肤/头发/五官。

新 skill 的 [SKILL.md](SKILL.md) 必须很短：指示读取 `references/router.md`，按主体 route 和材质 route 选择相关 reference 与 `*_base_style.md`，再组合 `shared_style_invariants.md`、`negative_prompt.md`、`generation_formula.md` 和用户需求。

`router.md` 必须支持：

```yaml
subject_routes:
  face: 人脸、头像、半身特写、面部表情、妆容、发型
  full_body: 人物全身、角色立绘、动作人物、服装造型
  environment: 无人场景、建筑、室内、室外、空间氛围
  object: 物品、道具、产品、材质近景
  mixed: 只读取实际涉及主体类型，不默认全读
material_routes:
  skin: 皮肤、面部、手部、可见肌肤
  hair: 头发、毛发、绒毛、动物毛
  fabric: 布料、服装、织物、窗帘、软装
  leather: 皮革、漆皮、皮带、皮包、皮质服装
  metal: 金属、首饰、盔甲、机械、刀剑、五金
  glass: 玻璃、水晶、镜片、透明容器、透明折射宝石
  plastic: 塑料、树脂、涂层、合成材料
  wood: 木头、木家具、木地板、树干、木制道具
  stone: 石头、岩壁、雕塑、混凝土、砖石
  ceramic: 陶瓷、瓷器、釉面器皿、瓷砖
  paper: 纸张、书页、卡纸、包装、卷轴
  liquid: 水、油、饮料、透明液体、湿润表面
  emissive: 发光材质、霓虹、能量、屏幕、魔法辉光
  rubber: 橡胶、哑光软质合成表面、轮胎、密封件
  makeup: 妆容、眼影、唇釉、腮红、粉质/膏状彩妆
  foliage: 叶片、草、苔藓、植物纤维、自然植被纹理
```

路由规则：无人环境不读人物文件；物品不读人物文件；人脸不读环境/物品文件，除非用户明确要求复杂场景或道具。材质按画面实际材质叠加，例如香水瓶读 `object + glass + metal`，石头神庙读 `environment + stone`，妆容头像读 `face + skin + makeup`。

## 10. 最终回复

完成时输出简短 YAML：

```yaml
generated_style_skill:
  path: <relative path only>
  skill_name: ...
  files_ready: true
fit_notes:
  macro_medium: pure_3d_render | pure_2d | 2_5d | 2d_3d_hybrid | realistic_photography
  best_iteration: ...
  style_match_score: ...
  stable_traits: []
  remaining_minor_differences: []
router_summary:
  subject_routes: [face, full_body, environment, object, mixed]
  material_routes: [skin, hair, fabric, leather, metal, glass, plastic, wood, stone, ceramic, paper, liquid, emissive, rubber, makeup, foliage]
```

不要输出冗长实验日志，除非用户要求。若保留过程文件，只能写 `references/iteration_notes.md`。

## 11. 交付前最小检查

- 已读取 [prompt_formula.md](prompt_formula.md)。
- 已判定大类媒介，且没有默认写成 2.5D。
- 已单独记录 `surface_language`，并用可见笔触、纸/画布纹理、过渡方式、材质分区和高光设计区分 `pure_2d` 与 `2_5d`。
- 已记录 `global_noise_or_speckle`、`texture_distribution` 与纹理证据区域；没有证据时未加入任何颗粒诱发词。
- 已记录 `style_signal_split`。
- 没有把相近配色、幻想题材、服装、草原、蓝天白云或“高质量感”当作风格匹配证据。
- 已检查人物服饰与背景植被的细节完整性；没有把重复花纹、挂件、草叶、花朵或笔触当作高细节。
- `[BASE_STYLE]` 包含风格指纹，不只是管线词；没有内容污染。
- `[LIGHT_COLOR]` 使用柔和全局光 / 大面积面光源 / 受控高光；绘画媒介转译为大色块和柔和笔触。
- `[NEGATIVE]` 含过曝、油亮、点光源热点、闪点污染稳定负面项；参考图无颗粒证据时也含全局噪点稳定负面项。
- 至少完成 2 轮，每轮真实生成并检查 4 张候选图。
- 任一候选图未通过媒介、表面语言、噪点覆盖、人物造型、材质响应、细节分布、细节完整性、风格指纹、光照质量或全身生命力门槛时已继续迭代。
- 已在 100% 尺寸检查天空、皮肤、墙面、衣料中间调等大色块；候选与材质锚点均通过 `noise_overlay_gate`。
- 已生成 16 张独立材质/纹理锚点；工具支持时已并发；没有宫格、合集、atlas、contact sheet 或裁切图。
- 已按“用户指定路径优先，否则使用 `pwd`”确定输出位置。
- 创建前已检查目标名称；若同名文件夹存在，已使用递增后缀选择从未存在的新名称，没有覆盖、合并、删除、重命名、复用或写入任何已有文件夹。
- 已创建全新 skill 文件夹，含 [SKILL.md](SKILL.md)、`references/router.md`、`shared_style_invariants.md`、4 张主体 reference、16 张材质 reference、各自 `*_base_style.md`、`negative_prompt.md`、`generation_formula.md`。
- 所有记录、产物文件和最终回复中的路径均为相对路径，没有全局/绝对路径。
