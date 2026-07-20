# Hermes All-in-One Creative Director

[中文文档](README.zh.md)

This is a production-oriented creative-skill library for Hermes Agent and Codex. It turns an agent into a combined producer, director, art director, asset manager, and visual QA reviewer—not merely a prompt writer.

The library is organized around a dependency-aware workflow: establish the source story, turn it into shot groups, build reusable assets and references, write executable image or video tasks, then review the output before it becomes a downstream reference.

## Skill Map

| Stage | Skills | Main outcome |
| --- | --- | --- |
| Production foundation | `creative-production-pipeline` | A gated end-to-end production workflow and asset order. |
| Story and shot design | `script-to-shot-table`, `manga-creation-pipeline` | Generate-ready shot groups, comic stories, and comic pages. |
| Assets and art direction | `character-reference-pipeline`, `image-art-direction` | Reusable character assets and qualified visual references. |
| Generation planning | `image-generation-plan`, `video-prompt-director` | Per-image TOML plans and production-ready video prompts. |
| Quality and style | `image-quality-check`, `style-distill`, `cover-image` | General visual QA, reusable style extraction, and Chinese video covers. |

## Skills

### 1. Production foundation

#### [creative-production-pipeline](creative-production-pipeline/SKILL.md) — Creative producer and director

Use this as the top-level workflow when the input is a premise, world setting, outline, episodic plan, or other unstructured creative material. It defines stage gates from source-document confirmation through script, shot groups, assets, image/video production, and post-generation review.

- Keeps story, shot design, asset work, and generation execution in their proper order.
- Requires reusable identity anchors, scenes, props, and costumes before dependent concept stills, comic pages, or video work.
- Protects canon and continuity: do not let image plans or prompts invent plot, change relationships, or reuse failed assets.
- Use it to decide *what must exist next*, then hand off to a more specialized skill.

### 2. Story, shot groups, and comics

#### [script-to-shot-table](script-to-shot-table/SKILL.md) — Script-to-shot-group director

Converts scripts, synopses, novel excerpts, ad scripts, narration, and loose scene descriptions into Markdown shot-group documents for AI images, video, and comics.

- Makes the shot group—not a fragmented single-shot list—the default production unit.
- Gives each group one clear narrative task, with only the action beats needed to explain continuity.
- Supports compact delivery with ID, suggested duration, scene, characters, and concise content; expanded directing fields are added only when requested.
- Provides a clean handoff to image plans, video prompts, key stills, or comic pages.

#### [manga-creation-pipeline](manga-creation-pipeline/SKILL.md) — Manga writer, director, and page planner

Develops a comic from a world, story direction, or character premise into a readable chapter and generation-ready page groups.

- Separates stable worldbuilding from chapter story material and page-generation instructions.
- Helps evaluate a small set of viable comic directions, write chapter escalation and hooks, and control when information is revealed.
- Treats one shot group as one comic image or page: a splash, multi-panel page, action page, montage, or emotional beat.
- Specifies mobile-readable panel counts, page ratios, reading order, composition hierarchy, and prompt structure.

#### [video-prompt-director](video-prompt-director/SKILL.md) — AI video prompt director

Turns a confirmed shot group or scene segment into a concise, visual, audible, and model-executable video prompt.

- Organizes prompts as environment → character placement → continuous action → timed dialogue → motivated camera movement → ending image → sound.
- Controls action density against clip duration so a short clip does not contain an unrenderable sequence of events.
- Requires actual inspection and a single clear role for every bound reference image.
- Makes dialogue operational by specifying speaker, language, exact line, and timing; it does not submit generation tasks unless asked.

### 3. Asset pipeline and art direction

#### [character-reference-pipeline](character-reference-pipeline/SKILL.md) — Character asset librarian

Standardizes temporary character images, group shots, and text descriptions into reusable character references that prevent identity drift.

- Classifies characters by importance and creates only the needed front headshot, back-of-head view, front/back full-body standee, costume, or state assets.
- Establishes one clean source face as the identity anchor; all later face-bearing images must derive identity from that source.
- Separates identity assets from costume/state references and keeps the latter from contaminating facial identity.
- Defines background, framing, naming, shallow directory, and acceptance rules for production-ready character libraries.

#### [image-art-direction](image-art-direction/SKILL.md) — Reference reviewer and visual art director

Use this when the task is to inspect, select, or judge images rather than to write a TOML plan.

- Reads images instead of inferring content from filenames.
- Grades references as primary, partial, atmosphere-only, or unusable according to their exact intended use.
- Separates content correctness from style compatibility and downstream-reference safety.
- Reviews composition, rendering medium, material treatment, identity continuity, spatial plausibility, and generation defects; it can recommend a replacement without rewriting the plan.

### 4. Image planning and quality gates

#### [image-generation-plan](image-generation-plan/SKILL.md) — Image producer and TOML task planner

Creates self-contained per-image TOML production plans from existing shot groups, production packages, and approved assets.

- Enforces the prerequisite: do not make an image plan directly from a script or outline before shot groups exist.
- Plans assets in executable order: environment → props/tools/clothes → characters → conceptual scene stills.
- Assigns each task an ID, target path, references, aspect ratio, prompt, and `# todo`/`# done` state.
- Keeps prompts self-contained, paths relative, references explicitly numbered and scoped, and concept stills tied to shot groups rather than treated as arbitrary frames.
- Governs reusable project-level character and prop assets, plan validation, and TOML-specific continuity constraints.

#### [image-quality-check](image-quality-check/SKILL.md) — General image QA gate

Evaluates whether a generated image is technically usable and safe to accept or pass into later production stages. It deliberately does not judge pure style similarity.

- Checks file integrity, dimensions, aspect ratio, alpha requirements, task compliance, subject/identity, anatomy, physical contact logic, composition, and common generation artifacts.
- Returns a structured status: `PASS`, `PASS_WITH_NOTES`, `REGENERATE_MINOR`, `REGENERATE_MAJOR`, or `BLOCKED`.
- Produces focused repair directives without generating files, saving images, or editing a production plan.
- Hands technically valid style-test images to a dedicated style-match stage rather than confusing quality QA with style validation.

### 5. Style work and publishing assets

#### [style-distill](.agents/skills/style-distill-v1.4/SKILL.md) — Reusable visual-style extraction and iteration

Runs a full style-distillation pipeline when a user asks to get, extract, distill, or reverse-engineer a reference image's visual style.

- Classifies the reference medium before prompting: pure 2D, pure 3D render, 2.5D, 2D/3D hybrid, or photography.
- Separates transferable style invariants from reference-specific content such as characters, props, and scenes.
- Requires real generation and visual comparison: at least two rounds of four cross-content test images, followed by sixteen independent material/texture anchors.
- Creates a new reusable style-generator skill directory only after the visual gates pass; it is not a prompt-only workflow.

#### [cover-image](.agents/skills/cover-image/SKILL.md) — Chinese video cover and thumbnail designer

Creates polished Chinese video covers from a supplied reference image, especially for AI and technical tutorials with exact title text.

- Preserves the reference's soft-light, detailed 3D portrait aesthetic while protecting the face from text overlap.
- Defaults to a three-ratio cover set—16:9, 4:3, and 3:4—unless the user requests a single format.
- Requires exact Chinese title verification; when generation corrupts text, it calls for deterministic local typography correction.
- Keeps images in the conversation by default and writes a file only when the user supplies an explicit destination outside the skill directory.

## Recommended Workflow

### Film, episodic video, or AI short

1. Use `creative-production-pipeline` to establish authoritative sources and production gates.
2. Write the script or story, then use `script-to-shot-table` to create shot groups.
3. Use `character-reference-pipeline` for new recurring characters; use `image-art-direction` to approve scenes, props, and external references.
4. Use `image-generation-plan` to create asset-first TOML tasks from the confirmed shot groups.
5. Use `video-prompt-director` for video segments derived from those groups.
6. Use `image-quality-check` before accepting an image as a deliverable or future reference.

### Comic

1. Use `manga-creation-pipeline` to develop the direction, chapter story, information-release plan, and pages.
2. Build and approve character references before page generation.
3. Create page-level image tasks from confirmed comic shot groups, then apply quality review.

### Style-led project or tutorial publishing

1. Use `style-distill` to turn a reference style into a tested reusable skill.
2. Use the production and image-planning skills to apply the resulting style without copying reference-specific content.
3. Use `cover-image` for the final Chinese video thumbnail or cover.

## Directory Layout

- Root-level skill directories contain the main creative-production skills.
- `.agents/skills/` contains Codex-oriented packaging for `style-distill` and `cover-image`.
- `image-generation-plan/references/` contains focused rules for headshots, front/back standees, and differentiating character appearances.

# Contact

![](./.docs/wechat.svg)

WeChat

# Sponsor

![](./.docs/pay.webp)

WeChat Tip