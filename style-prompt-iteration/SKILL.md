---
name: style-prompt-iteration
description: Codex/ChatGPT 专用的纯美术风格获取、提取、萃取、蒸馏和迭代技能。用户说 get style、distill style、extract style、style extraction、style distillation、获取风格、提取风格、萃取画风、反推风格等任何中英文类似意图时触发完整 pipeline：先判定参考图媒介大类（纯2D、纯3D渲染、2.5D、2D+3D混合、真实摄影），再真实生成候选图、读图对比、自我修正，至少完成2轮4类验证图迭代，并生成16张独立材质/纹理锚点图（工具支持时并发），最终产出可复用的新风格 skill 文件夹。禁止只输出提示词或只生成 prompt 文件。
version: 1.4.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [
      image-style,
      prompt-iteration,
      art-direction,
      image-generation,
      style-matching,
      style-extraction,
      style-distillation,
      get-style,
      extract-style,
      distill-style,
    ]
    aliases: [
      get-style,
      get-style-prompt,
      style-get,
      style-extract,
      style-distill,
      art-style-extraction,
      art-style-distillation,
      extract-style-prompt,
      distill-style-prompt,
      获取风格,
      获得风格,
      获取画风,
      获得画风,
      提取风格,
      提取美术风格,
      萃取画风,
      蒸馏风格,
      反推风格,
      获得风格提示词,
    ]
    related_skills: [image-art-direction]
---

# 纯美术风格提示词迭代

## 0. 不可跳过的执行规则

当用户要求获取、提取、萃取、蒸馏、反推参考图风格，且上下文包含参考图/风格图时，本技能必须进入完整图片迭代模式。触发词包括但不限于：

- English: `get style`, `get the style`, `get style prompt`, `get art style`,
  `extract style`, `distill style`, `style extraction`, `style distillation`,
  `derive style`, `reverse style`, `create style skill`, `make style skill`,
  `style from reference`.
- 中文：`获取风格`、`获得风格`、`获取画风`、`获得画风`、`提取风格`、`提取美术风格`、`萃取画风`、`蒸馏风格`、`反推风格`、`获得风格提示词`、`从参考图获得风格`、`生成风格技能`。

`get style` 不是轻量触发词，不允许只生成 prompt 文件；它等同于要求执行完整
pipeline：

1. 读取 `./style-prompt-iteration/prompt_formula.md`。
2. 查看参考图并判定大类媒介。
3. 写初版 `[BASE_STYLE]`、`[LIGHT_COLOR]`、`[NEGATIVE]`。
4. 调用图片生成工具，至少完成 2 轮：每轮 4 张候选图。
5. 打开候选图逐张对比，修订 prompt，再生成下一轮。
6. 生成并检查 16 张独立材质/纹理锚点图。
7. 落盘一个新风格生成 skill 文件夹。

禁止只输出提示词、只做文字分析、只生成 1 张图、只跑 1
轮、把“建议下一步生成”当作完成。若没有图片生成工具、工具失败、额度不足或参考图不可读，必须明确报告阻塞，并只把初版
prompt 标为临时草稿。

路径写法硬约束：任何记录、日志、YAML、Markdown、最终回复和新 skill
文件中，只能写相对路径；禁止写全局/绝对路径，例如
`/Users/...`、`/private/...`、`C:\...`、`file://...`。已生成文件也必须用相对路径引用。外部图片工具返回的临时
`http(s)://...` URL 只可用于下载或检查；落盘记录、最终回复和新 skill
文件必须记录下载后的相对路径，不记录临时 URL。

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

本技能主要修订 `[BASE_STYLE]`，但必须显式写 `[LIGHT_COLOR]` 的柔和光照约束和
`[NEGATIVE]`
的过曝/油亮失败项。不得把参考图具体人物、服装、道具、场景、景别、时间、剧情写进
`[BASE_STYLE]`。

## 2. 大类媒介判定

第一步必须从五类中选择一个主类，并写证据：

- `pure_2d`：手绘/平面插画、线稿、笔触、色块、纸面/画布纹理主导；无稳定 3D
  几何、PBR、摄影镜头证据。
- `pure_3d_render`：CG/游戏/Octane/Unreal/Blender/ZBrush/KeyShot
  等渲染感主导；有三维几何体积、PBR/SSS、毛发系统、景深、接触阴影、环境反射、材质响应。
- `2_5d`：平面插画为主，但用强体积光影、软面塑形或伪 3D 质感增强；缺少真实 3D
  管线证据。
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

大类判错时后续全部失败。纯 3D 不得写成 2.5D / digital painting / anime
illustration；纯 2D 不得写 PBR / SSS / ray-traced；混合风格必须分别描述 2D 层和
3D 层。

## 3. 风格提取边界

### 必须进入风格 prompt

- 媒介、渲染、线条、笔触/纹理、色彩、明暗、材质处理、完成度。
- 风格指纹：形状语言、比例理想化方式、边缘层级、明暗语法、材质细节频率、色彩配比、镜头后期、完成度边界。
- 人体/肢体生命力：形体体积、肌肉/皮肤平面、重心、姿态受力、衣料服从身体、透视下的形体存在感。

### 必须排除内容污染

不得把具体主体、身份、服装、道具、场景、动作、表情、景别、时间、天气、世界观、剧情写入
`[BASE_STYLE]`。这些只能进入 `[CONTENT]` 或 `[COMPOSITION]`。

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

## 4. 全局光照质量门槛

无论媒介是 2D、2.5D、3D、混合还是真实摄影，都必须避开以下失败光照：

- 过曝皮肤、过曝白衣、亮斑冲白、亮部无色彩层次。
- 不自然镜面反射、湿油感、塑料感、油膜感、廉价 glossy 高光。
- 点光源热点、硬闪光、小光斑、星点泛滥、粒子/高光污染。
- 过强 rim light、过硬 specular streak、不受控白线高光。
- 雨水、汗水、湿身、玻璃、金属、皮革等材质被渲染成油腻脏亮。

默认追求：

- `soft global illumination`, `broad area light`, `large diffused light source`,
  `controlled specular rolloff`, `preserved highlight color detail`。
- 3D/摄影：area lights / softboxes / bounced light，而不是 point lights / hard
  flash / tiny hotspot。
- 2D/2.5D/绘画：大面积色块、柔和笔触、低噪声明暗过渡、受控局部提亮，而不是碎亮点、油亮线、高频闪烁反光。

`[LIGHT_COLOR]` 必须包含柔和全局光、大面积面光源、受控高光。`[NEGATIVE]`
必须包含：`overexposed highlights`, `blown-out whites`, `oily wet shine`,
`greasy specular reflections`, `point-light hotspots`, `sparkle pollution`,
`harsh flash lighting`,
`uncontrolled glossy reflections`。这些是稳定失败防线，不受“少写
negative”的一般原则限制。

候选图只要出现过曝/油亮/热点/闪点污染，即使其他风格维度接近，也必须失败并继续修订。

## 5. 禁用词和 negative 原则

不要使用以下空泛精修词，除非用户原文要求逐字使用：

- `fashion magazine cover polish`
- `crisp manga-cover / fashion magazine finish`
- `fashion magazine finish`
- `manga-cover finish`
- `crisp manga-cover`

`[NEGATIVE]` 只写真正负面失败项。能正向表达的内容不要写 negative，例如用
`simple background` / `low-detail background` 替代
`not over-detailed background`。例外是第 4 节的过曝/油亮/热点稳定负面项。

## 6. 两轮四图迭代

每轮必须生成 4 张独立候选图，使用同一版风格 prompt，测试风格跨内容迁移：

1. `face_closeup`：人脸 / 头像 /
   半身特写；检验脸部、五官、皮肤、头发、局部细节频率。
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
  face_closeup: { full_generation_prompt: ..., candidate_image: ... }
  full_body: { full_generation_prompt: ..., candidate_image: ... }
  environment: { full_generation_prompt: ..., candidate_image: ... }
  object_closeup_in_environment: {
    full_generation_prompt: ...,
    candidate_image: ...,
  }
```

## 7. 对比与修订

每轮必须打开 4
张候选图逐张检查。忽略具体主体、服装、道具、场景、构图、日夜、动作、剧情；只评估纯美术风格。

硬门槛：

- `macro_medium_gate`：候选图主媒介必须与参考图一致。
- `style_fingerprint_gate`：不能只是同媒介/同管线/同质量；必须匹配形状语言、比例理想化、边缘层级、明暗语法、材质细节频率、色彩配比、完成度边界。
- `lighting_quality_gate`：不得过曝、油亮、点光源热点、硬闪光、星点污染、不受控
  glossy 高光。
- `full_body_life_gate`：全身图必须有形体体积、肌肉/皮肤平面、重心、肢体张力、衣料受力；脸和配色接近不能抵消身体失败。

报告格式：

```yaml
iteration: 1
tests:
  macro_medium_gate: { pass: false, reason: ... }
  style_fingerprint_gate: { pass: false, reason: ... }
  lighting_quality_gate: { pass: false, reason: ... }
  face_closeup: {
    style_match_score: 0.72,
    pass: false,
    missing_or_weak: [],
    excess_or_wrong: [],
  }
  full_body: {
    style_match_score: 0.80,
    pass: false,
    missing_or_weak: [],
    excess_or_wrong: [],
  }
  environment: {
    style_match_score: 0.90,
    pass: true,
    missing_or_weak: [],
    excess_or_wrong: [],
  }
  object_closeup_in_environment: {
    style_match_score: 0.86,
    pass: false,
    missing_or_weak: [],
    excess_or_wrong: [],
  }
overall_pass: false
prompt_update:
  add_to_base: []
  remove_from_base: []
  update_light_color: []
  add_to_neg: []
stop: false
```

修订原则：一轮只解决最明显的 2-4
个偏差；优先精准风格词，少堆质量词；删除冲突词。媒介错先修媒介；媒介对但不像先补风格指纹；过曝/油亮/热点先修
`[LIGHT_COLOR]` 并保留光照 negative。

停止条件：

- 至少完成 2 轮，每轮 4 张图。
- 当前轮 4 张图全部通过所有硬门槛，且每张 `style_match_score >= 0.9`。
- 任一图失败或只完成 1 轮，必须继续迭代。

## 8. 16 张材质/纹理锚点

最终新 skill 必须包含 16 张默认材质/纹理
reference，每个材质是一个独立图片生成任务。工具支持并发时应并发提交 16
个独立请求；如果不支持并发则顺序生成。禁止 4x4 宫格、contact
sheet、atlas、sprite sheet、大图合集、先生成大图再 crop。每张图必须有独立
prompt、独立相对输出路径、独立检查记录；如果工具只返回临时
URL，必须下载到相对路径后再记录。

默认材质：

```text
skin, hair, fabric, leather, metal, glass, plastic, wood,
stone, ceramic, paper, liquid, emissive, rubber, makeup, foliage
```

材质图应是中性材质样本、材质球或简单材质块，不得做成复杂道具、角色或场景。每个
`materials/*_base_style.md`
只写该材质的反射/粗糙度、纹理频率、边缘高光、磨损/裂纹/纤维/气泡等微细节、与整体色彩系统的关系。

## 9. 最终新 skill 产物

默认必须在当前 agent 运行的 working directory（`pwd`）下创建一个全新的 skill
文件夹，禁止覆盖或复用已存在文件夹。若目标名已存在，必须改用另一个不会冲突的新名称，例如追加
`-2` /
`-3`，或按用户输入语言改写成同义新名；创建前必须检查路径不存在。文件夹名和 skill
name 必须与用户输入语言一致：用户用英文提出风格需求时使用英文 hyphen-case，例如
`watercolor-ink-style`；用户用中文提出风格需求时使用简洁中文名，例如
`水墨淡彩风格`。例如如果当前 `pwd` 是 `X`，最终产物应放在
`X/<style-name>-style/` 或同语言等价名称下。不要只在对话中贴 prompt。不要创建
`examples/`、`specs/`、README、CHANGELOG、INSTALLATION_GUIDE。

创建方式硬约束：不要手工从零搭目录。必须把本技能自带的 `template/` 文件夹整体复制到目标路径，并把复制后的文件夹重命名为合理的风格名。`template/` 是唯一结构参考；复制后将空 `.md` 文件替换为真实内容，将空 `.png` 占位文件替换为真实图片。若实际输入图超过 `original/image1.png`、`image2.png`、`image3.png`，可在 `original/` 下继续追加同语言/同序列命名的真实图片；若迭代超过 `iteration2/`，可继续追加 `iterations/iteration3/` 等目录。除这些“追加真实输入/迭代产物”的情况外，不要改变模板目录结构。

### 目录结构：
```
<style-name>-style/
    SKILL.md
    references/
        shared_style_invariants.md
        router.md
        face_base_style.md
        full_body_base_style.md
        environment_base_style.md
        object_base_style.md
        negative_prompt.md
        generation_formula.md
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
    # archival only: original input images, never loaded by router during normal use
    original/
        image1.png
        image2.png # if any
        image3.png # if any
        etc.
    # archival only: all output images generated during iterations, never loaded by router during normal use
    iterations/
        iteration1/
            face.png
            full_body.png
            environment.png
            object.png
        iteration2/ # if any
```

4 类主体风格描述必须来自真实迭代产出，但最后一轮的
`face.png`、`full_body.png`、`environment.png`、`object.png` 不得复制到
`references/`，只能保存在对应的 `iterations/iteration*/` 归档目录中。
`original/` 和 `iterations/` 只保存过程归档：它们必须随 skill 文件夹交付，但在该
skill 被用于生成新图时不得被 `SKILL.md`、`router.md` 或默认使用流程读取、引用或纳入风格判断。
新 skill 的生成流程只能读取 `references/` 下的文件；主体路由只使用
`face_base_style.md`、`full_body_base_style.md`、`environment_base_style.md`、`object_base_style.md`
等文本风格描述，材质路由可使用 `references/materials/*.png` 和对应 `*_base_style.md`。

- `face_base_style.md`：只写脸、皮肤、五官、发丝、面部边缘、脸部细节频率。
- `full_body_base_style.md`：只写人体比例、形体体积、姿态受力、衣料服从身体、全身材质分区。
- `environment_base_style.md`：只写空间、建筑/自然材质、背景色块、光影层级、环境细节频率；不得写皮肤/头发/五官。
- `object_base_style.md`：只写物品轮廓、材质、边缘、反射折射、细节密度、放置环境统一性；不得写人体/皮肤/头发/五官。

新 skill 的 [SKILL.md](SKILL.md) 必须很短：只作为入口，指示读取
`references/router.md`，按主体 route 和材质 route 只选择 `references/` 下的相关文件与
`*_base_style.md`，再组合
`shared_style_invariants.md`、`negative_prompt.md`、`generation_formula.md`
和用户需求。复杂风格内容必须放在 `references/`，不要塞回入口 `SKILL.md`。入口和
router 必须明确排除 skill 根目录下的 `original/` 与
`iterations/`，这些过程图只用于审计和复盘，不能参与新图生成。

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

路由规则：无人环境不读人物文件；物品不读人物文件；人脸不读环境/物品文件，除非用户明确要求复杂场景或道具。材质按画面实际材质叠加，例如香水瓶读
`object + glass + metal`，石头神庙读 `environment + stone`，妆容头像读
`face + skin + makeup`。

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
  material_routes: [
    skin,
    hair,
    fabric,
    leather,
    metal,
    glass,
    plastic,
    wood,
    stone,
    ceramic,
    paper,
    liquid,
    emissive,
    rubber,
    makeup,
    foliage,
  ]
```

不要输出冗长实验日志，除非用户要求。若保留过程文件，只能写
`iterations/iteration_notes.md`，不得放进 `references/`。

## 11. 交付前最小检查

- 已读取 [prompt_formula.md](prompt_formula.md)。
- 已判定大类媒介，且没有默认写成 2.5D。
- 已记录 `style_signal_split`。
- `[BASE_STYLE]` 包含风格指纹，不只是管线词；没有内容污染。
- `[LIGHT_COLOR]` 使用柔和全局光 / 大面积面光源 /
  受控高光；绘画媒介转译为大色块和柔和笔触。
- `[NEGATIVE]` 含过曝、油亮、点光源热点、闪点污染稳定负面项。
- 至少完成 2 轮，每轮真实生成并检查 4 张候选图。
- 任一候选图未通过媒介、风格指纹或光照质量门槛时已继续迭代；全身候选图未通过
  `full_body_life_gate` 时已继续迭代。
- 已生成 16
  张独立材质/纹理锚点；工具支持时已并发；没有宫格、合集、atlas、contact sheet
  或裁切图。
- 已创建全新的、未覆盖既有目录的 skill 文件夹；文件夹名和 skill name
  与用户输入语言一致。
- 已将本技能自带的 `template/` 整体复制到目标路径并重命名；所有空 `.md` 已替换为真实内容，所有空 `.png` 占位文件已替换为真实图片。
- 已创建新 skill 文件夹，含
  [SKILL.md](SKILL.md)、`references/router.md`、`shared_style_invariants.md`、4
  个主体 `*_base_style.md`、16 张材质 reference、各自
  `*_base_style.md`、`negative_prompt.md`、`generation_formula.md`。
- 已保存原始输入图到根目录 `original/`，并保存每轮迭代输出图到根目录
  `iterations/`；入口 SKILL 和 router 明确排除这些过程图，正常生成新图时不会读取或使用它们。
- `references/` 下没有保存 `face.png`、`full_body.png`、`environment.png`、`object.png`；这些候选图只存在于 `iterations/`。
- 所有记录、产物文件和最终回复中的路径均为相对路径，没有全局/绝对路径。
