#!/usr/bin/env -S deno run --allow-read

// Validates the directory structure documented in style-distill/target_structure.md.

const skillDir = Deno.args[0];

if (!skillDir || Deno.args.length !== 1) {
  console.error(
    "Usage: deno run --allow-read validate-generated-skill.ts <skill-dir>",
  );
  Deno.exit(1);
}

const requiredDirectories = [
  "references",
  "references/materials",
  "original",
  "iterations",
];

const requiredFiles = [
  "SKILL.md",
  "references/shared_style_invariants.md",
  "references/router.md",
  "references/face_base_style.md",
  "references/full_body_base_style.md",
  "references/environment_base_style.md",
  "references/object_base_style.md",
  "references/negative_prompt.md",
  "references/generation_formula.md",
];

const materials = [
  "skin",
  "hair",
  "fabric",
  "leather",
  "metal",
  "glass",
  "plastic",
  "wood",
  "stone",
  "ceramic",
  "paper",
  "liquid",
  "emissive",
  "rubber",
  "makeup",
  "foliage",
];

const iterationFiles = [
  "face.png",
  "full_body.png",
  "environment.png",
  "object.png",
];

for (const material of materials) {
  requiredFiles.push(
    `references/materials/${material}.png`,
    `references/materials/${material}_base_style.md`,
  );
}

const errors: string[] = [];

function path(relative: string): string {
  return `${skillDir.replace(/[\\/]+$/u, "")}/${relative}`;
}

async function stat(relative: string): Promise<Deno.FileInfo | undefined> {
  try {
    return await Deno.stat(path(relative));
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return undefined;
    throw error;
  }
}

try {
  const root = await Deno.stat(skillDir);
  if (!root.isDirectory) errors.push(`${skillDir}: not a directory`);

  for (const directory of requiredDirectories) {
    const info = await stat(directory);
    if (!info) errors.push(`${directory}: missing directory`);
    else if (!info.isDirectory) errors.push(`${directory}: expected directory`);
  }

  for (const file of requiredFiles) {
    const info = await stat(file);
    if (!info) errors.push(`${file}: missing file`);
    else if (!info.isFile) errors.push(`${file}: expected file`);
  }

  const originalDir = await stat("original");
  if (originalDir?.isDirectory) {
    const originals = [];
    for await (const entry of Deno.readDir(path("original"))) {
      if (entry.isFile && /\.png$/iu.test(entry.name)) {
        originals.push(entry.name);
      }
    }
    if (originals.length === 0) {
      errors.push("original/: requires at least one PNG file");
    }
  }

  const iterationsDir = await stat("iterations");
  if (iterationsDir?.isDirectory) {
    const iterations: Array<{ name: string; number: number }> = [];

    for await (const entry of Deno.readDir(path("iterations"))) {
      if (!entry.isDirectory) continue;
      const match = entry.name.match(/^iteration([1-9][0-9]*)$/u);
      if (!match) {
        errors.push(
          `iterations/${entry.name}: expected directory name iterationN`,
        );
        continue;
      }
      iterations.push({ name: entry.name, number: Number(match[1]) });
    }

    iterations.sort((a, b) => a.number - b.number);
    if (iterations.length === 0 || iterations[0].number !== 1) {
      errors.push("iterations/: missing iteration1 directory");
    }

    for (let index = 0; index < iterations.length; index++) {
      const expected = index + 1;
      if (iterations[index].number !== expected) {
        errors.push(`iterations/: missing iteration${expected} directory`);
        break;
      }
    }

    for (const iteration of iterations) {
      for (const file of iterationFiles) {
        const relative = `iterations/${iteration.name}/${file}`;
        const info = await stat(relative);
        if (!info) errors.push(`${relative}: missing file`);
        else if (!info.isFile) errors.push(`${relative}: expected file`);
      }
    }
  }
} catch (error) {
  errors.push(
    `${skillDir}: ${error instanceof Error ? error.message : String(error)}`,
  );
}

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  Deno.exit(1);
}

Deno.exit(0);
