import { spawnSync } from "node:child_process";
import { mkdir, rm, cp, writeFile, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prepare } from "./prepare.mjs";
const repo = fileURLToPath(new URL("../../", import.meta.url));
const preview =
  process.argv[2] === "--preview" ? path.resolve(process.argv[3] || "") : null;
if (process.env.BLOG_PRIVATE_PREVIEW === "1" && !preview)
  throw Error("Preview flag cannot affect a production build");
const rows = await prepare(repo, preview);
const result = spawnSync(
  path.join(repo, "node_modules/.bin/astro"),
  ["build", "--root", path.join(repo, "blog")],
  {
    cwd: repo,
    stdio: "inherit",
    env: { ...process.env, BLOG_PRIVATE_PREVIEW: preview ? "1" : "0" },
  },
);
if (result.status !== 0) process.exit(result.status || 1);
const dist = path.join(repo, ".generated/blog/dist");
if (preview) {
  console.log("Private output only: " + dist);
  process.exit(0);
}
const target = path.join(repo, "public/blog");
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(dist, target, { recursive: true });
// Only successfully rendered releases enter public discovery.
for (const row of rows) {
  await readFile(path.join(target, row.slug, "index.html"));
}
await writeFile(
  path.join(repo, "content/articles.json"),
  JSON.stringify(rows, null, 2) + "\n",
);
await writeFile(
  path.join(target, "release.json"),
  JSON.stringify({
    withdrawn: JSON.parse(
      await readFile(path.join(repo, ".generated/blog/withdrawn.json"), "utf8"),
    ),
    articles: rows.map((r) => ({
      slug: r.slug,
      bundle_digest: r.bundleDigest,
      renderer_digest: r.rendererDigest,
    })),
  }),
);
console.log(
  "Published article build: " + rows.length + " authorised articles.",
);
