---
name: style-distill
description: >-
  纯美术风格获取、提取、萃取、蒸馏、候选图生产与最终风格技能打包流水线。Use when the user asks get style, distill
  style, extract style, style extraction, style distillation, get-style-prompt,
  获取风格、提取风格、萃取画风、蒸馏风格、反推风格、生成风格技能 or similar intents from reference images.
  This skill owns style specification, prompt revision, candidate generation,
  iteration control and packaging. It must send every candidate through
  image-quality-check and then send quality-approved candidates through
  validate-style-match; it must not perform either validation itself.
---

# Style Distill / 纯美术风格蒸馏

## 0. 生产职责与不可跳过流程

当用户要求获取、提取、萃取、蒸馏、反推参考图风格，且上下文包含参考图/风格图时，本技能必须进入完整图片迭代模式。触发词包括但不限于：

- English: `get style`, `get the style`, `get style prompt`, `get art style`,
  `extract style`, `distill style`, `style extraction`, `style distillation`,
  `derive style`, `reverse style`, `create style skill`, `make style skill`,
  `style from reference`.
- 中文：`获取风格`、`获得风格`、`获取画风`、`获得画风`、`提取风格`、`提取美术风格`、`萃取画风`、`蒸馏风格`、`反推风格`、`获得风格提示词`、`从参考图获得风格`、`生成风格技能`。

`get style` 等请求进入完整生产流水线：

1. 读取 `./style-distill/prompt_formula.md`。
2. 查看参考图并判定大类媒介。
3. 写初版 `style_spec`、`[BASE_STYLE]`、`[LIGHT_COLOR]`、`[NEGATIVE]`。
4. 按参考覆盖范围和目标用途生成本轮候选图。
5. 每张候选图立即交给 `image-quality-check`；未通过的图不得进入风格验证。
6. 将全部通用质检通过的候选图、参考图和 `style_spec` 交给 `validate-style-match`。
7. 只根据 `quality_result.repair_directives` 或 `style_validation.repair_directives` 修订生产 prompt，然后进入下一轮。
8. 生成并检查最终材质/纹理锚点图。
9. 只在最终轮通过独立风格验证后，落盘新风格 skill 文件夹。

本技能不得自己给候选图作通用质量结论或风格匹配结论，不得覆盖两个验证技能的状态。若没有图片生成工具、工具失败、额度不足或参考图不可读，明确报告阻塞，并只把初版 prompt 标为临时草稿。

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

本技能主要修订 `[BASE_STYLE]`、`[LIGHT_COLOR]` 和 `[NEGATIVE]`。光线与失败项必须来自参考图的可观察特征或已发生的生成伪影，不得默认改成柔光、低对比或其他偏好。不得把参考图具体人物、服装、道具、场景、景别、时间、剧情写进 `[BASE_STYLE]`。

### Style specification 生产契约

在生成第一轮候选图前，写出与 `validate-style-match` 兼容的 `style_spec`：

```yaml
style_spec:
  schema_version: 1
  reference_images: []
  target_model: ""
  target_domains: []
  observed:
    medium_appearance: ""
    shape_language: ""
    edge_hierarchy: ""
    palette: ""
    tonal_structure: ""
    lighting: ""
    surface_response: ""
    detail_frequency: ""
    postprocess: ""
    finish_boundary: ""
  conditional_rules: []
  unsupported_domains: []
  prompt_fragments:
    base_style: ""
    light_color: ""
    negative: ""
```

每个维度区分参考图中直接观察到的内容、合理推断和无证据外推。参考图不支持的主体领域写入 `unsupported_domains`，不伪造已验证的风格结论。

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

尤其不要把性别、年龄、年龄阶段、身份、族群、职业、角色气质或审美评价写进可迁移风格。
`male / female / man / woman / girl / boy / feminine / masculine / young /
adult / young-adult / child / teen / elderly` 以及
`男性 / 女性 / 少女 / 少年 / 青年 / 成年 / 年轻 / 儿童 / 老年`
都属于主体或角色内容，不属于风格 base prompt。

### `face_base_style.md` 硬边界

生成新 skill 的 `face_base_style.md` / face base prompt 时，只写可迁移的脸部渲染语言：

- rendering / technique：3D 或 2D 渲染方式、面部平面处理、边缘层级、细节频率、镜头/后期质感。
- material：皮肤、发丝、眼部湿润度、SSS、毛孔、粗糙度、specular rolloff、材质微细节。
- lighting：光质、光源面积、漫反射/反射控制、高光保色、阴影软硬和面部体积塑形。

不得写性别、年龄、年龄阶段、身份、表情、具体脸型偏好、吸引力评价、日夜时间或场景光线。
光照只能写光质和技术控制，不得写 `day / night / daylight / nighttime /
sunset` 或 `白天 / 夜晚 / 日光 / 黄昏` 这类时间环境。

错误例：`Pure high-end 3D portrait render with softened but realistic young-adult facial planes.`
正确方向：`Pure high-end 3D portrait render with softened but realistic facial planes,
controlled SSS skin response, fine pore detail, and broad soft key light with preserved highlight color.`

### `environment_base_style.md` 硬边界

生成新 skill 的 `environment_base_style.md` / environment base prompt 时，只写可迁移的环境渲染语言：

- rendering / technique：空间深度处理、边缘层级、表面细节频率、景深/雾化/后期质感、笔触或渲染管线。
- material：墙面、地面、石材、木材、陶瓷、金属、植被等表面响应、粗糙度、微纹理和反射控制。
- color systems：低饱和/高饱和、冷暖关系、明度层级、局部强调色比例、整体色彩组织；不要写精确颜色名。
- lighting：光质、光源面积、漫反射、接触阴影、体积塑形、高光保色和阴影软硬。

不得写室内/室外、建筑类型、房间类型、地理地点、时代场景、天气、日夜时间或具体场景内容。
`indoor / outdoor / interior / exterior / room / hall / corridor /
street / garden / temple / city / forest / day / night / daylight /
nighttime / sunset` 以及 `室内 / 室外 / 内景 / 外景 / 房间 / 大厅 /
走廊 / 街道 / 花园 / 寺庙 / 城市 / 森林 / 白天 / 夜晚 / 日光 / 黄昏`
都属于内容或场景，不属于 environment base prompt。

错误例：`Spaces should use quiet gray-taupe interiors, smooth plaster, stone, ceramic, or muted wood with subtle microtexture.`
正确方向：`Low-chroma neutral color system with restrained warm-cool shifts,
matte mineral and muted natural material response, subtle surface microtexture,
soft broad illumination, controlled contact shadows, and preserved highlight color.`

### 单张参考图拆分

写初版 prompt 前记录：

```yaml
style_signal_split:
  transferable_invariants:
    - 可跨主体迁移的美术语言
  conditional_style_variables:
    - 只适用于人脸、头发、皮革、金属等局部材质/主体的处理
  non_transferable_content:
    - 具体人物、服装、场景、构图、道具、性别、年龄、身份、室内/室外、日夜时间等内容特征
  missing_risk_if_only_pipeline_words:
    - 只写 PBR / SSS / high-end render 会丢失的风格指纹
```

把 `[BASE_STYLE]` 中媒介/管线词删掉后，剩余词仍必须能描述可识别画风。

## 4. 参考相对的光线与伪影控制

- 先提取参考图中的光质、方向、对比、高光形状、阴影语法和反射方式，再写 `[LIGHT_COLOR]`。
- 硬闪光、点光源、强 rim light、镜面反射、风格化过曝或塑料高光若是参考图的有意特征，必须保留，不得自动写入 `[NEGATIVE]`。
- 只将参考图没有、且在生成中造成内容不可读或材质污染的额外伪影写入 `[NEGATIVE]`。
- 通用图片缺陷由 `image-quality-check` 判定；光线是否忠实匹配参考由 `validate-style-match` 判定。
- 本技能只负责根据两者的 `repair_directives` 修改生产 prompt。

## 5. 禁用词和 negative 原则

不要使用以下空泛精修词，除非用户原文要求逐字使用：

- `fashion magazine cover polish`
- `crisp manga-cover / fashion magazine finish`
- `fashion magazine finish`
- `manga-cover finish`
- `crisp manga-cover`

`[NEGATIVE]` 只写已有参考证据或已发生的生成失败项。能正向表达的内容不要写 negative，例如用 `simple background` / `low-detail background` 替代 `not over-detailed background`。

所有风格 reference 文件都必须先写 positive constraints，再写 negative constraints。
凡是能用正向约束表达的内容，不要再写成负向约束：用 `low detail`，不要写
`not high detail`；用 `high detail`，不要写 `not low detail`。负向约束只保留真正的失败模式、污染项或工具常见错误。

## 6. 候选图生产

默认测试下列四个 domain，但只有它们出现在 `target_domains` 中，且参考集有直接证据时，才是硬性验证项：

1. `face_closeup`：人脸、头像或半身特写。
2. `full_body`：人物全身、比例、姿态和衣料。
3. `environment`：无人空间、建筑或自然环境。
4. `object_closeup_in_environment`：物品近景与周边环境。

参考图未覆盖的 domain 可用于外推测试，但必须在 `style_spec.unsupported_domains` 或生成记录中标为 `SYNTHESIZED`，不得当作忠实匹配证据。

同一轮使用同一版风格 prompt 和稳定测试内容。工具支持时固定 seed 和生成参数，并记录模型/版本，避免把随机波动误当作 prompt 改进。

```yaml
iteration: 1
style_spec_version: 1
generator: ""
model_version: ""
seed: null
prompt_fragments:
  base_style: ""
  light_color: ""
  negative: ""
candidates:
  - candidate_id: "iteration1-face"
    domain: face_closeup
    evidence_type: OBSERVED | INFERRED | SYNTHESIZED
    full_generation_prompt: ""
    candidate_image: ""
```

## 7. 三技能协作与迭代

每轮严格按以下顺序：

1. **生产候选图**
   - `style-distill` 保留候选图、完整 prompt、参考图用途、轮次和生成器参数。

2. **通用质量闸门**
   - 对每张候选图使用 `image-quality-check`。
   - `PASS / PASS_WITH_NOTES` 且 `eligible_for_style_validation = true`：进入风格验证集。
   - `REGENERATE_MINOR / REGENERATE_MAJOR`：只根据 `quality_result.repair_directives` 重生当前候选；不先改风格规格。
   - `BLOCKED`：停止当前候选链并报告。

3. **独立风格验证**
   - 只将全部通用质量合格的候选图、参考图和 `style_spec` 交给 `validate-style-match`。
   - `style-distill` 不重复执行风格判定，也不把预期结论写进验证输入。

4. **消费验证状态**
   - `PASS`：记录当前轮为已验证轮。
   - `REVISE`：一轮只根据 `style_validation.repair_directives` 修正最明显的 2-4 个偏差，再生成新一轮。
   - `INSUFFICIENT_EVIDENCE`：将相应 domain 标为不支持/外推，或请求更多参考图；不伪造通过结论。
   - `BLOCKED`：根据 `next_step` 返回通用质检、补齐输入或停止。

迭代默认至少 2 轮、最多 3 轮，除非用户明确修改轮次/预算。只有已完成至少 2 轮，且最终轮 `style_validation.status = PASS` 时才打包最终风格 skill。达到轮次或预算上限仍为 `REVISE`时，交付当前最佳草稿和剩余偏差，不无限生成。

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

每张材质图也必须先通过 `image-quality-check`。只有参考图或 `style_spec` 对该材质有 `OBSERVED` 证据时，才将其交给 `validate-style-match` 作忠实匹配验证；没有直接证据的材质标为 `SYNTHESIZED`，只检查通用质量和与已验证不变量的相容性，不声称已与原参考严格匹配。

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

创建方式硬约束：直接按下方“目录结构”创建全新 skill，所有 Markdown 必须包含可执行的真实内容，所有 PNG 必须是可解码的真实图片，不得创建空文件或占位文件。`original/` 与 `iterations/` 必须按真实数量整理：原始输入图有几张就保留几张；实际生成了几轮就创建几个 `iterations/iterationN/` 目录，不得保留没有真实产物的空目录。

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
        image1.png # duplicate/add/remove to match the real number of input images
    # archival only: all output images generated during iterations, never loaded by router during normal use
    iterations/
        iteration1/
            face.png
            full_body.png
            environment.png
            object.png
        # add iteration2/, iteration3/, ... only when those iterations actually exist
```

4 类主体风格描述必须来自真实迭代产出，但最后一轮的
`face.png`、`full_body.png`、`environment.png`、`object.png` 不得复制到
`references/`，只能保存在对应的 `iterations/iteration*/` 归档目录中。
`original/` 和 `iterations/` 只保存过程归档：它们必须随 skill 文件夹交付，但在该
skill 被用于生成新图时不得被 `SKILL.md`、`router.md` 或默认使用流程读取、引用或纳入风格判断。
新 skill 的生成流程只能读取 `references/` 下的文件；主体路由只使用
`face_base_style.md`、`full_body_base_style.md`、`environment_base_style.md`、`object_base_style.md`
等文本风格描述，材质路由可使用 `references/materials/*.png` 和对应 `*_base_style.md`。

- `shared_style_invariants.md`：必须是简单 Markdown，不要写 YAML、frontmatter、JSON、表格或配置式键值结构。先写正向约束，再写负向约束；正向约束应包含可迁移的媒介、渲染/绘制技法、材质处理、色彩系统、光照质量、边缘层级和完成度。负向约束只写正向约束无法充分表达的失败模式；能写成 `low detail` / `high detail` 这类正向词时，不要写 `not high detail` / `not low detail`。
- `face_base_style.md`：只写脸部的渲染、技法、材质和光照质量，例如面部平面处理、SSS/毛孔/发丝/眼部材质、边缘层级、细节频率、soft global illumination、受控高光；不得写性别、年龄、年龄阶段、身份、表情、吸引力评价、具体脸型内容，也不得写 day/night/daylight/nighttime 或中文日夜时间。
- `full_body_base_style.md`：只写人体比例、形体体积、姿态受力、衣料服从身体、全身材质分区。
- `environment_base_style.md`：只写环境的渲染、技法、材质、色彩系统和光照质量，例如空间深度处理、边缘层级、表面材质响应、粗糙度、微纹理、低/高饱和色彩组织、冷暖关系、光质、光源面积、接触阴影；不得写室内/室外、建筑类型、房间类型、地理地点、天气、日夜时间或具体场景内容，也不得写精确颜色名。
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
  quality_gate: PASS | PASS_WITH_NOTES
  style_validation_status: PASS
  evidence_coverage:
    observed: []
    inferred: []
    synthesized: []
    unsupported: []
  stable_traits: []
  remaining_minor_differences: []
router_summary:
  subject_routes: [face, full_body, environment, object, mixed]
  material_routes: [skin, hair, fabric, leather, metal, glass, plastic, wood, stone, ceramic, paper, liquid, emissive, rubber, makeup, foliage]
```

不要输出冗长实验日志，除非用户要求。若保留过程文件，只能写
`iterations/iteration_notes.md`，不得放进 `references/`。

## 11. 交付前最小检查

- 已读取 [prompt_formula.md](prompt_formula.md)。
- 已判定大类媒介，且没有默认写成 2.5D。
- 已记录 `style_signal_split`。
- 已生成 `style_spec`，包含参考来源、目标领域、可观察特征、条件规则和不支持领域。
- `[BASE_STYLE]` 包含风格指纹，不只是管线词；没有内容污染。
- `[LIGHT_COLOR]` 和 `[NEGATIVE]` 已服从参考证据与实际生成失败，没有把柔光或去高光当成普适默认。
- 每张候选图都已获得 `image-quality-check` 的 `quality_result`；未通过图没有进入风格验证。
- 每轮合格候选集都已获得 `validate-style-match` 的 `style_validation`，生产技能没有覆盖验证结论。
- 至少完成 2 轮，未超过用户授权的轮次/预算上限，最终轮 `style_validation.status = PASS`。
- 已生成 16
  张独立材质/纹理锚点；工具支持时已并发；没有宫格、合集、atlas、contact sheet
  或裁切图。
- 所有材质图已通过通用质检；没有直接参考证据的材质已标为 `SYNTHESIZED`。
- 已创建全新的、未覆盖既有目录的 skill 文件夹；文件夹名和 skill name
  与用户输入语言一致。
- 已按规定目录结构创建最终 skill；所有 Markdown 均包含可执行的真实内容，所有 PNG 均是可解码的真实图片，没有空文件或占位文件。
- 已按真实数量整理 `original/` 和 `iterations/`：没有固定保留多余输入图占位，也没有固定保留不存在的第 2 / 第 3 轮迭代目录。
- 已创建新 skill 文件夹，含
  [SKILL.md](SKILL.md)、`references/router.md`、`shared_style_invariants.md`、4
  个主体 `*_base_style.md`、16 张材质 reference、各自
  `*_base_style.md`、`negative_prompt.md`、`generation_formula.md`。
- `shared_style_invariants.md` 是简单 Markdown，不是 YAML/frontmatter/JSON/表格；正向约束在前，负向约束在后，且没有把可正向表达的内容写成 `not ...` 负向约束。
- `face_base_style.md` / face base prompt 只含脸部渲染、技法、材质和光照质量；没有性别、年龄、年龄阶段、身份、表情、审美评价、day/night/daylight/nighttime 或中文日夜时间。
- `environment_base_style.md` / environment base prompt 只含环境渲染、技法、材质、色彩系统和光照质量；没有 indoor/outdoor/interior/exterior、建筑/房间/地点类型、天气、day/night/daylight/nighttime、中文室内外/日夜时间或精确颜色名。
- 已保存原始输入图到根目录 `original/`，并保存每轮迭代输出图到根目录
  `iterations/`；入口 SKILL 和 router 明确排除这些过程图，正常生成新图时不会读取或使用它们。
- `references/` 下没有保存 `face.png`、`full_body.png`、`environment.png`、`object.png`；这些候选图只存在于 `iterations/`。
- 所有记录、产物文件和最终回复中的路径均为相对路径，没有全局/绝对路径。
