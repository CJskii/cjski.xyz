import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { importDraft } from "./import.mjs";
const [bundle, ...flags] = process.argv.slice(2);
if (!bundle)
  throw Error("Usage: prepare-review.mjs BUNDLE [--export] [--send]");
if (flags.includes("--send") && !flags.includes("--export"))
  throw Error("Review card requires its protected preview export");
const draft = await importDraft(path.resolve(bundle));
const base = "/releases/website-preview/" + draft.id;
function run(bin, args, env = process.env) {
  const r = spawnSync(bin, args, { stdio: "inherit", env });
  if (r.status !== 0)
    throw Error("Preparation step failed; no publication was performed");
}
run(
  process.execPath,
  ["scripts/blog/build.mjs", "--preview", draft.directory],
  { ...process.env, BLOG_PREVIEW_BASE: base },
);
run(process.execPath, ["scripts/blog/check-preview.mjs", draft.directory], {
  ...process.env,
  BLOG_PREVIEW_BASE: base,
});
const url =
  "https://blog-preview.cjskii.duckdns.org" +
  base +
  "/" +
  draft.record.slug +
  "/";
if (flags.includes("--export")) {
  const container =
    process.env.WEBSITE_PREVIEW_CONTAINER ||
    "hermes-agent-6w9qjn3uhsizvdsifspfuwa4";
  const target =
    "/home/hermes/.hermes/workspace/tasks/export-deliverable-artifacts/exports" +
    base;
  const exists = spawnSync("docker", ["exec", container, "test", "-e", target]);
  if (exists.status === 0)
    throw Error(
      "Preview snapshot already exists; inspect/reuse it rather than overwrite it",
    );
  run("docker", ["exec", container, "mkdir", "-p", target]);
  run("docker", [
    "cp",
    path.resolve(".generated/blog/dist") + "/.",
    container + ":" + target,
  ]);
  console.log(
    JSON.stringify({
      private_preview_url: url,
      draft_directory: draft.directory,
      publication_authorised: false,
    }),
  );
}
if (flags.includes("--send")) {
  const registry = process.env.WEBSITE_PUBLICATION_REGISTRY;
  if (!registry) throw Error("Configure shared WEBSITE_PUBLICATION_REGISTRY");
  const r = spawnSync(
    process.execPath,
    ["scripts/blog/request.mjs", draft.directory, url, registry],
    { encoding: "utf8" },
  );
  if (r.status !== 0) throw Error("Review request could not be registered");
  const request = JSON.parse(r.stdout);
  run(process.execPath, [
    "scripts/blog/send-request.mjs",
    request.registry_file,
  ]);
}
if (!flags.includes("--export"))
  console.log(
    JSON.stringify({
      private_output: ".generated/blog/dist",
      preview_base: base,
      draft_directory: draft.directory,
      publication_authorised: false,
    }),
  );
