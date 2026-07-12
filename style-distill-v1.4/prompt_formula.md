# Prompt Formula

```text
[BASE_STYLE]
[CONTENT]
[LIGHT_COLOR]
[COMPOSITION]
[NEGATIVE]
```

## Example

```text
[BASE_STYLE]
modern Japanese editorial anime illustration, painterly digital painting, matte color blocks, restrained hand-painted edges, thin sketchy contour lines, soft blended shading, muted cinematic palette, clean broad color fields, quiet smooth midtone areas, no added texture overlay

[CONTENT]
simple test subject for this iteration, plain neutral background, simple readable space

[LIGHT_COLOR]
soft global illumination, broad area light, large diffused light source, controlled highlight rolloff, preserved highlight color detail, low-to-medium contrast, muted blue-gray palette with warm coral accents

[COMPOSITION]
clear readable framing

[NEGATIVE]
overexposed highlights, blown-out whites, oily wet shine, greasy specular reflections, point-light hotspots, sparkle pollution, harsh flash lighting, uncontrolled glossy reflections, glossy plastic hair, wet specular hair, hard vector lineart, film grain, digital noise, uniform paper grain, dense speckle, all-over stippling, texture overlay, compression-like artifacts
```

若参考图确有可验证的媒介颗粒，删除与证据冲突的噪点 negative，并用带区域、覆盖率、尺度、密度和强度的局部纹理描述替代；禁止只写无约束的 `grain` 或 `paper texture`。
