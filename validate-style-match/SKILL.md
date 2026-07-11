---
name: validate-style-match
description: 独立的图像风格匹配验证技能。用于将已通过通用图片质检的候选图，与参考图和 style specification 对照，判断媒介外观、形状语言、边缘层级、色彩、明暗、光线、材质和完成度是否匹配。当用户要求判断“像不像参考画风”、比较多轮风格候选、验收风格提示词或 style-distill 提交了候选图时使用。不生成图片、不修改提示词、不打包技能，也不替代 image-quality-check 的技术、内容、解剖和物理质检。
---

# 验证风格匹配

## 职责边界

本技能只回答一个问题：候选图是否在有证据支持的维度上匹配目标风格。

- 不检查文件是否损坏、人体解剖、物理接触、人数、道具或 prompt 内容完整性；这些由 `image-quality-check` 负责。
- 不调用图片生成工具，不直接重生候选图。
- 不直接改写 `[BASE_STYLE]`、`[LIGHT_COLOR]` 或 `[NEGATIVE]`；只返回可观察的偏差和修订指令。
- 不把柔光、写实体积、低饱和或高精细度当成普适优点；判断必须相对参考图和 style specification。

## 必备输入

验证前收集：

- 候选图，并给每张图稳定的 `candidate_id` 和 `domain`。
- 参考图，并标明每张图可支持的主体领域和风格维度。
- `style_spec`，至少包含参考来源、目标领域、已观察风格、条件规则和不支持领域。
- 每张候选图的 `quality_result`。只有 `PASS` 或不影响风格判断的 `PASS_WITH_NOTES` 才能进入本验证。
- 如果要比较迭代，提供轮次、生成器/模型、完整生成 prompt 和可用的 seed/参数。

候选图没有通用质检结果时，先使用 `image-quality-check`；不在本技能中猜测通用质量。

## Style specification 最小契约

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

只对 `observed` 和 `conditional_rules` 中有参考证据的项目作硬判断。`unsupported_domains` 不能判为失败。

## 证据分级

每项结论标明证据类型：

- `OBSERVED`：参考图中可直接看见，可用于验证。
- `INFERRED`：根据多个可观察特征推断，只能作辅助判断。
- `SYNTHESIZED`：参考图没有直接证据，是生产技能的外推；不能作为“忠实匹配”的证据。

参考图只有人像时，不得宣称已验证环境或植被风格；应将其标为 `INSUFFICIENT_EVIDENCE`。

## 验证维度

按 style specification 和参考图实际支持范围选择：

1. **媒介外观**：平面绘画、体积渲染、摄影感、混合或其他可观察外观。
2. **形状语言**：轮廓几何、比例理想化、曲直关系和造型节奏。
3. **边缘层级**：硬边、软边、线条、焦内/焦外与边缘丢失。
4. **色彩系统**：色相关系、饱和度、明度分布、冷暖结构和强调色比例。
5. **明暗与光线**：光质、方向、对比、阴影语法、高光形状和是否保留参考的有意硬光/过曝。
6. **材质与表面响应**：粗糙度、反射、透光、笔触、纹理频率和材质间区分。
7. **细节频率与完成度**：主体与背景细节分配、噪声、锐化、笔触和交付边界。
8. **后期与镜头语法**：颗粒、光晕、景深、色散、锐化和可观察的镜头感。

不得因候选图不够“高级”、“柔和”、“写实”或“精致”而判失败，除非这些确实是参考风格的可观察特征。

## 执行流程

1. **验证通用质检门禁**
   - 确认每张候选图的 `quality_result.status` 为 `PASS` 或可比较的 `PASS_WITH_NOTES`。
   - 其他状态返回 `BLOCKED`，原因写 `quality_gate_failed`。

2. **审计参考集**
   - 判断多张参考是否属于同一风格系统。
   - 冲突时标注分组或离群图，不擅自平均成一个风格。

3. **建立证据覆盖表**
   - 为每个 domain 和验证维度标记 `OBSERVED / INFERRED / SYNTHESIZED / UNSUPPORTED`。
   - 不对未覆盖领域作硬性通过/失败判定。

4. **逐图对比**
   - 先记录候选图的可观察事实，再与参考和 style specification 对照。
   - 每个偏差必须写明参考证据、候选证据和影响范围。

5. **检查跨主体一致性**
   - 只对参考集已支持的 domain 检查可迁移不变量。
   - 不要求人像、环境、物品使用不分主体的完全相同细节。

6. **返回状态和修订指令**
   - 不输出无评分定义的小数分数。
   - 一轮最多返回 2-4 个最高优先级的 `repair_directives`。

## 决策状态

- `PASS`：所有有证据支持的必要维度都匹配，可接受当前轮。
- `REVISE`：存在可定向修复的风格偏差；返回偏差证据和修订指令。
- `INSUFFICIENT_EVIDENCE`：参考图不足以验证某个 domain 或维度；这不等于候选图失败。
- `BLOCKED`：通用质检未通过、图片不可读、参考集彻底冲突或必备输入缺失。

## 输出契约

```yaml
style_validation:
  schema_version: 1
  iteration: 1
  status: PASS | REVISE | INSUFFICIENT_EVIDENCE | BLOCKED
  quality_gate:
    accepted_candidate_ids: []
    rejected_candidate_ids: []
  reference_audit:
    coherent: true
    groups: []
    outliers: []
  coverage:
    observed: []
    inferred: []
    synthesized: []
    unsupported: []
  candidates:
    - candidate_id: ""
      domain: ""
      verdict: PASS | REVISE | INSUFFICIENT_EVIDENCE
      matched: []
      deviations: []
      evidence: []
  repair_directives: []
  next_step: accept | revise_prompt | request_references | return_to_quality_check | stop
```

## 与生产技能的交接

- `PASS`：`style-distill` 可将当前轮作为已验证产物。
- `REVISE`：`style-distill` 只根据 `repair_directives` 修改最明显的 2-4 个偏差，然后生成新一轮。
- `INSUFFICIENT_EVIDENCE`：`style-distill` 将对应领域标为不支持/外推，或请求更多参考图；不伪造通过结论。
- `BLOCKED`：按 `next_step` 返回通用质检、补齐输入或停止。

## 交付前检查

- [ ] 每张候选图已通过 `image-quality-check`。
- [ ] 没有对参考不支持的领域宣称验证通过。
- [ ] 结论引用了可观察的参考证据和候选证据。
- [ ] 没有使用未定义的小数匹配分数。
- [ ] 没有生成图片、改写 prompt、修改产物或打包 skill。
- [ ] 输出状态、证据、修订指令和 `next_step` 完整。
