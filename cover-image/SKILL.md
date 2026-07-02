---
name: cover-image
description: Create Chinese video cover images and thumbnails from a reference image, especially for AI/tech tutorial covers requiring exact Chinese title text, soft-light 3D-rendered portrait aesthetics, and multiple aspect ratios such as 16:9, 4:3, and 3:4. Use when the user asks to make, redo, or adjust cover images/thumbnails with a supplied reference image, Chinese text, and exportable PNG/JPG deliverables.
---

# Cover Image

## Core Intent

Create polished Chinese video cover images from a supplied reference image while preserving the reference's soft-light, high-precision 3D-rendered portrait feel. Prioritize accurate text, usable thumbnail composition, and final files saved in the active task's `outputs` directory.

## Required Skill Chaining

When generating or editing raster cover imagery, use `$imagegen` first and follow its built-in tool workflow. Treat the user-provided image as the primary reference or edit target.

If the image model produces inaccurate Chinese text, use deterministic local post-processing to cover and redraw the exact requested text with an installed Chinese-capable font. Do not accept misspelled, duplicated, or substituted title text as final.

## Default Cover Requirements

Use these defaults unless the user says otherwise:

- Text: two title lines, exactly as provided by the user.
- For the recurring AI tutorial cover pattern, use:
  - `Image2超精度3D渲染`
  - `Codex智能体`
- Aspect ratios: create one 16:9 cover, one 4:3 cover, and one 3:4 cover.
- Suggested output sizes:
  - 16:9: `1920x1080`
  - 4:3: `1600x1200`
  - 3:4: `1200x1600`
- Output format: PNG unless the user asks for another format.
- Save final deliverables under the current workspace `outputs/` folder with clear filenames such as `cover_16x9.png`, `cover_4x3.png`, and `cover_3x4.png`.

## Visual Direction

Preserve the reference image's aesthetic before adding cover polish:

- Keep soft daylight, gentle highlights, and natural skin tones.
- Avoid harsh contrast, action-poster lighting, smoky dark grading, heavy black shadows, and over-saturated orange/blue color casts.
- Keep the image bright enough to feel close to the reference, not dramatically darker.
- Preserve the subject's face identity, hair detail, clothing color, and premium realistic 3D-rendered texture.
- Use subtle readability treatment behind text: soft shadow, light stroke, gentle darkening, or local blur only where needed.

## Composition Rules

Protect the face. Text may overlap the body, jacket, shoulders, chest, lower hair, or background, but must not cover the eyes, nose, mouth, or main face area.

For 16:9:

- Put the face on the right or center-right.
- Use left or lower-left space for the two-line title.
- Keep title spacing generous and readable at thumbnail size.

For 4:3:

- Avoid cramped title blocks.
- Let the title occupy lower-left or lower-middle space and overlap body/clothing if needed.
- Prefer comfortable line spacing and margins over forcing all text into a narrow side column.

For 3:4:

- Keep the face in the upper half.
- Put the title in the lower third or lower quarter.
- Allow text to cover the jacket/body but not the face.

## Prompt Pattern

Use a structured prompt like this, adapting only the user-specific text and ratios:

```text
Use case: ads-marketing
Asset type: Chinese video cover thumbnail, <aspect ratio>.
Input image: use the provided image as the primary visual reference. Preserve the same realistic ultra-detailed 3D-rendered subject, face identity, soft skin, detailed hair, clothing, and gentle soft daylight from the reference image.
Primary request: Create a polished Chinese video cover with a bright, soft look. Avoid harsh contrast, smoky dark grading, heavy black shadows, and action-poster lighting. Keep the palette close to the reference: soft neutral daylight, warm skin tones, airy background, refined high-precision 3D render feeling.
Text (verbatim, two lines only):
"<line 1>"
"<line 2>"
Typography: bold modern title type, large and readable; first line white, second line warm gold or another user-approved accent; subtle outline/shadow only enough for readability.
Composition/framing: <ratio-specific placement>. Text may overlap body/clothing, but must not cover eyes, nose, mouth, or the main face area.
Constraints: Chinese text must be exactly the two lines above, no misspellings, no extra text, no watermark.
```

## Validation

Before finishing:

1. Inspect each image visually.
2. Confirm the text is exact and contains no extra text.
3. Confirm lighting remains soft and not significantly darker than the reference.
4. Confirm text does not cover the face.
5. Confirm dimensions with an image tool such as `sips -g pixelWidth -g pixelHeight`.
6. Report final saved paths and dimensions.
