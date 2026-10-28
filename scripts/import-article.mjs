import { readFile, mkdir, copyFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
const candidate = path.resolve(
  process.argv[2] ||
    "/home/cjski/website-planning/2026-10-26/first-family-candidate",
);
const contract = JSON.parse(
  await readFile(path.join(candidate, "IMPORT_CONTRACT.json"), "utf8"),
);
if (
  contract.draft !== true ||
  contract.publication_authorised !== false ||
  contract.family_id !== "ai-worker-health-story-20261025"
)
  throw new Error("Unexpected import contract");
const bytes = new Map();
for (const [file, expected] of Object.entries(contract.files)) {
  if (
    !/^(source\.md|article\.html|assets\/availability-(desktop|mobile)\.svg)$/.test(
      file,
    )
  )
    throw new Error("Unexpected import path");
  const data = await readFile(path.join(candidate, file));
  if (createHash("sha256").update(data).digest("hex") !== expected)
    throw new Error(`Hash mismatch: ${file}`);
  bytes.set(file, data);
}
if (!bytes.get("source.md").toString().includes("draft: true"))
  throw new Error("Draft flag missing");
const output = path.resolve(
  "content/private/local-model-worker-cloud-fallback",
);
await mkdir(path.join(output, "assets"), { recursive: true });
for (const [file, data] of bytes)
  await writeFile(path.join(output, file), data);
await copyFile(
  path.join(candidate, "IMPORT_CONTRACT.json"),
  path.join(output, "IMPORT_CONTRACT.json"),
);
console.log(
  "Verified and imported four exact v3 artifacts as a private draft. No public content was created.",
);
