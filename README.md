# Hermes 全能编导

本项目是为 Hermes Agent 专门优化的创作技能项目，不是普通提示词合集。

它把编剧、导演、美术、角色资产、图片计划、视频提示词、漫画页与制片管理流程，整理成一组可被 Hermes 稳定调用的工作技能。目标是让 Hermes 在内容项目中承担“全能编导 + 美术指导 + 制片统筹”的复合角色：理解故事、拆镜头、控资产、写计划、审画面、管连续性，并把结果落到可执行文件。

最终生成的图片制作计划，可以让Codex连续工作10小时以上，生成100+高质量图片。

## 技能列表

1. [`creative-production-pipeline`](creative-production-pipeline/SKILL.md)：总制片 / 总导演；从故事、设定或分集大纲组织完整 AI 内容生产流水线。
2. [`script-to-shot-table`](script-to-shot-table/SKILL.md)：分镜导演；把剧本、梗概、广告脚本或小说段落转为镜头组。
3. [`image-art-direction`](image-art-direction/SKILL.md)：美术指导；制定图片风格、分析参考图、审查候选图和生成后质检。
4. [`character-reference-pipeline`](character-reference-pipeline/SKILL.md)：角色资产导演；建立正脸、背面、立绘、服装状态等标准角色资产。
5. [`image-generation-plan`](image-generation-plan/SKILL.md)：图片制片 / 任务编排；把镜头组、制作包和资产整理为逐张图片生成 TOML 任务。
6. [`video-prompt-director`](video-prompt-director/SKILL.md)：视频导演；把镜头组或场景段落转成可执行视频提示词。
7. [`manga-creation-pipeline`](manga-creation-pipeline/SKILL.md)：漫画导演；发展漫画章节、分格页和漫画图任务。
8. [`reverse-image-prompt`](reverse-image-prompt/SKILL.md)：视觉分析师；观察参考图并反推可复现画面的图片提示词。
