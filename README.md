# Hermes All-in-One Creative Director

[中文文档](README.zh.md)

A creative skill library for Hermes Agent and Codex workflows—not a collection of ordinary prompts.

It packages screenwriting, directing, art direction, character assets, image plans, video prompts, comic pages, and production management into reliably callable skills. Its goal is to equip an agent to serve as a combined creative director, art director, and production coordinator on content projects: understanding stories, breaking down shots, managing assets, arranging plans, reviewing images, maintaining continuity, and turning the results into executable files.

## Skills

### Production and Narrative

1. [creative-production-pipeline](creative-production-pipeline/SKILL.md): Executive producer / director; organizes a complete AI-content production pipeline from a story, setting, or episodic outline.
2. [script-to-shot-table](script-to-shot-table/SKILL.md): Storyboard director; turns scripts, synopses, advertising scripts, or novel excerpts into shot groups for image, video, and comic production.
3. [manga-creation-pipeline](manga-creation-pipeline/SKILL.md): Manga director; develops comic chapters, shot groups, panel pages, and comic-image production workflows.
4. [video-prompt-director](video-prompt-director/SKILL.md): Video director; turns shot groups or scene excerpts into production-ready video prompts.

### Art Direction, Assets, and Image Production

5. [image-art-direction](image-art-direction/SKILL.md): Art director; selects and reviews reference images, and verifies candidate images for content, quality, and stylistic consistency.
6. [character-reference-pipeline](character-reference-pipeline/SKILL.md): Character-asset director; creates reusable, standardized character assets such as front views, back views, turnarounds, costumes, and state variations.
7. [image-generation-plan](image-generation-plan/SKILL.md): Image producer / task planner; turns shot groups, production packages, and assets into TOML tasks for individual image generation.
8. [image-quality-check](image-quality-check/SKILL.md): General image-quality gate; checks files, task compliance, identity, anatomy, physics, composition, and generation artifacts. It does not assess stylistic similarity.
9. [cover-image](cover-image/SKILL.md): Creates Chinese video covers and thumbnails from reference images.

### Style Extraction and Iteration

10. [style-distill-v1.4](style-distill-v1.4/SKILL.md): The currently maintained skill for pure visual-style extraction and iteration; generates candidate images from references, compares and revises them, and packages reusable style skills.
11. [style-distill-v1.6](style-distill-v1.6/SKILL.md): A style-distillation workflow version; organizes candidate-image iteration through image-quality checks and independent style validation.

## Recommended Workflow

A typical film, video, or AI-content project proceeds as: “story / setting → shot groups → assets and art references → image-generation plan → image or video production → quality review.” Complete the shot groups and asset-continuity work before planning individual images; do not skip the prerequisite production materials and generate in bulk directly.

# Contact Me
![](./.docs/wechat.svg)
WeChat

# Sponsor Me
![](./.docs/pay.webp)
WeChat Tip
