# Prompt Formula

```text
[BASE_STYLE]
[CONTENT]
[LIGHT_COLOR]
[COMPOSITION]
[NEGATIVE]
```

## 字段职责

- `[BASE_STYLE]`：可迁移的媒介外观、形状语言、边缘层级、材质处理、细节频率、后期与完成度。
- `[CONTENT]`：当前候选图的具体主体、数量、动作、场景、道具和内容边界。
- `[LIGHT_COLOR]`：从参考图观察得到的光质、方向、对比、色彩组织、高光形状和阴影语法。
- `[COMPOSITION]`：候选图的景别、机位、留白、主体占比和视觉层级。
- `[NEGATIVE]`：只写参考图没有、且已在生成中反复出现的具体伪影或污染项。目标生成器不支持独立 negative 参数时，由生产技能转为该生成器能理解的正向约束。

## 组合骨架

```text
[BASE_STYLE]
<observable transferable style from style_spec>

[CONTENT]
<fixed test content for the current candidate domain>

[LIGHT_COLOR]
<reference-relative lighting and color system>

[COMPOSITION]
<stable composition used for cross-iteration comparison>

[NEGATIVE]
<only evidenced recurring failures; omit when empty or unsupported>
```

不要在公式中预置 anime、painterly、柔光、低饱和、蓝灰/珊瑚配色或其他默认风格；所有风格信号均来自当前 `style_spec`。
