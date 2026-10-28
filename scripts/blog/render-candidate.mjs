// Render unreviewed agent output for independent SEO/QA inspection.
// This creates no release bundle, approval card, Git change or public output.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { parse } from "yaml";
import {
  safeRead,
  sha,
  canonical,
  rendererDigest,
  releaseIdentity,
  slugPattern,
} from "./contracts.mjs";
const [input, metadataFile, ...flags] = process.argv.slice(2);
if (!input || !metadataFile)
  throw Error(
    "Usage: render-candidate.mjs ASSEMBLED_FOLDER CANDIDATE_METADATA_JSON [--export]",
  );
const meta = JSON.parse(await readFile(metadataFile, "utf8"));
if (
  !slugPattern.test(meta.slug) ||
  !Array.isArray(meta.assets) ||
  !meta.assets.length ||
  meta.assets.length > 12
)
  throw Error("Candidate needs a safe slug and 1..12 documented figures");
const source = await safeRead(input, "source.md");
const evidence = await safeRead(input, "evidence.md");
const front = source.toString().match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
if (!front) throw Error("Article frontmatter required");
const data = parse(front[1], { maxAliasCount: 0, uniqueKeys: true });
if (
  !data.title ||
  !data.description ||
  data.title.length > 160 ||
  data.description.length > 240 ||
  data.fixture === true
)
  throw Error("Candidate title and description required; no fixture content");
const files = new Map([
  ["source.md", source],
  ["evidence.md", evidence],
]);
for (const asset of meta.assets) {
  if (
    !/^assets\/[a-zA-Z0-9_-]+\.(svg|png|webp|jpe?g)$/.test(asset.path) ||
    !asset.alt ||
    !asset.caption ||
    files.has(asset.path)
  )
    throw Error(
      "Each unique candidate figure needs a safe path, alt and caption",
    );
  const bytes = await safeRead(input, asset.path);
  if (
    asset.path.endsWith(".svg") &&
    /<!DOCTYPE|<!ENTITY|<(?:[\w.-]+:)?(?:script|foreignObject|animate|set|iframe)\b|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?!#)|@import|javascript:|expression\(|url\(\s*["']?(?!#)/i.test(
      bytes.toString(),
    )
  )
    throw Error("Active or externally linked SVG rejected");
  files.set(asset.path, bytes);
}
const record = {
  schema_version: 1,
  action: "review_candidate",
  review_status: "unreviewed",
  renderer_digest: await rendererDigest(process.cwd()),
  slug: meta.slug,
  title: data.title,
  description: data.description,
  canonical_url: "https://cjski.dev/blog/" + meta.slug,
  source_revision: "candidate-1",
  bundle_digest: sha(canonical([...files].map(([p, b]) => [p, sha(b)]))),
  files: Object.fromEntries([...files].map(([p, b]) => [p, sha(b)])),
  assets: meta.assets.map(({ path, alt, caption }) => ({ path, alt, caption })),
};
const id = releaseIdentity(record);
const folder = path.resolve("content/private/blog-candidates", id);
await mkdir(folder, { recursive: true, mode: 0o700 });
for (const [p, bytes] of files) {
  await mkdir(path.dirname(path.join(folder, p)), { recursive: true });
  await writeFile(path.join(folder, p), bytes, { mode: 0o600 });
}
await writeFile(
  path.join(folder, "request.json"),
  JSON.stringify(record, null, 2),
  { mode: 0o600 },
);
const base = "/releases/blog-candidates/" + id;
function run(bin, args, env = process.env) {
  const result = spawnSync(bin, args, { stdio: "inherit", env });
  if (result.status !== 0)
    throw Error("Candidate render/check failed; nothing was released");
}
const env = { ...process.env, BLOG_PREVIEW_BASE: base };
run(process.execPath, ["scripts/blog/build.mjs", "--preview", folder], env);
run(process.execPath, ["scripts/blog/check-preview.mjs", folder], env);
await writeFile(
  path.join(folder, "article.html"),
  await readFile(path.join(".generated/blog/dist", record.slug, "index.html")),
  { mode: 0o600 },
);
if (flags.includes("--export")) {
  const container =
    process.env.WEBSITE_PREVIEW_CONTAINER ||
    "hermes-agent-6w9qjn3uhsizvdsifspfuwa4";
  const destination =
    "/home/hermes/.hermes/workspace/tasks/export-deliverable-artifacts/exports" +
    base;
  if (
    spawnSync("docker", ["exec", container, "test", "-e", destination])
      .status === 0
  )
    throw Error("Immutable candidate preview already exists; reuse it");
  run("docker", ["exec", container, "mkdir", "-p", destination]);
  run("docker", [
    "cp",
    path.resolve(".generated/blog/dist") + "/.",
    container + ":" + destination,
  ]);
}
console.log(
  JSON.stringify({
    id,
    candidate_directory: folder,
    preview_url:
      "https://blog-preview.cjskii.duckdns.org" +
      base +
      "/" +
      record.slug +
      "/",
    review_status: "needs_independent_seo_qa_ceo",
    publication_authorised: false,
  }),
);
