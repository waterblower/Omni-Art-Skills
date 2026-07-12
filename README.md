# Hermes 全能编导

面向 Hermes Agent 与 Codex 工作流的创作技能库，不是普通提示词合集。

它将编剧、导演、美术、角色资产、图片计划、视频提示词、漫画页与制片管理整理为可稳定调用的工作技能。目标是让 Agent 在内容项目中承担“全能编导 + 美术指导 + 制片统筹”的复合角色：理解故事、拆解镜头、管理资产、编排计划、审核画面与维护连续性，并将结果沉淀为可执行文件。

## 技能列表

### 制片与叙事

1. [creative-production-pipeline](creative-production-pipeline/SKILL.md)：总制片 / 总导演；从故事、设定或分集大纲组织完整 AI 内容生产流水线。
2. [script-to-shot-table](script-to-shot-table/SKILL.md)：分镜导演；将剧本、梗概、广告脚本或小说段落转为面向图片、视频和漫画生产的镜头组。
3. [manga-creation-pipeline](manga-creation-pipeline/SKILL.md)：漫画导演；开发漫画章节、镜头组、分格页与漫画图生产流程。
4. [video-prompt-director](video-prompt-director/SKILL.md)：视频导演；将镜头组或场景段落转为可执行的视频提示词。

### 美术、资产与图片生产

5. [image-art-direction](image-art-direction/SKILL.md)：美术指导；选择和审查参考图，复核候选图的内容、画质与风格一致性。
6. [character-reference-pipeline](character-reference-pipeline/SKILL.md)：角色资产导演；建立正脸、背面、立绘、服装状态等可复用的标准角色资产。
7. [image-generation-plan](image-generation-plan/SKILL.md)：图片制片 / 任务编排；将镜头组、制作包和资产整理为逐张图片生成的 TOML 任务。
8. [image-quality-check](image-quality-check/SKILL.md)：通用图片质量闸门；检查文件、任务符合度、身份、解剖、物理、构图和生成伪影，不负责风格相似度判断。
9. [cover-image](cover-image/SKILL.md)：从参考图制作中文视频封面和缩略图。

### 风格提取与迭代

10. [style-distill-v1.4](style-distill-v1.4/SKILL.md)：当前维护的纯美术风格提取与迭代技能；从参考图生成候选图、比较修订，并打包可复用的风格技能。
11. [style-distill-v1.6](style-distill-v1.6/SKILL.md)：风格蒸馏流程版本；通过图片质量检查与独立风格验证组织候选图迭代。

## 使用顺序

典型影视或 AI 内容项目按“故事 / 设定 → 镜头组 → 资产与美术参考 → 图片生成计划 → 图片或视频生产 → 质量复核”推进。先完成镜头组与资产连续性，再编排逐张图片计划；不要跳过前置生产资料直接批量生成。

# Contact Me 联系我
![](./.docs/wechat.svg)
微信

# Sponsor Me 打赏感谢我
![](./.docs/pay.webp)
微信打赏
