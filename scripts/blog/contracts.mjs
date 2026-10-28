import { readFile, realpath, lstat } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { parse } from "yaml";
export const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const canonical = (value) =>
  JSON.stringify(sort(value)).replace(
    /[\u007f-\uffff]/g,
    (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"),
  );
function sort(v) {
  return Array.isArray(v)
    ? v.map(sort)
    : v && typeof v === "object"
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, sort(v[k])]),
        )
      : v;
}
export async function safeRead(root, relative) {
  if (
    typeof relative !== "string" ||
    relative.includes("\\") ||
    relative.startsWith("/") ||
    relative.split("/").some((x) => !x || x === "." || x === "..")
  )
    throw Error("Unsafe artifact path");
  const base = await realpath(root);
  let current = base;
  for (const part of relative.split("/")) {
    current = path.join(current, part);
    if ((await lstat(current)).isSymbolicLink())
      throw Error("Symlink artifact rejected");
  }
  if (
    !(await lstat(current)).isFile() ||
    (await lstat(current)).size > 8 * 1024 * 1024
  )
    throw Error("Invalid artifact size/type");
  return readFile(current);
}
export function digestManifest(m) {
  const data = {
    schema_version: 1,
    title: "",
    requested_action: "review_only",
    text_artifact: null,
    ...m,
    artifacts: m.artifacts.map((a) => ({ alt: "", caption: "", ...a })),
  };
  delete data.reviews;
  if (!data.social_media?.length) delete data.social_media;
  return sha(canonical(data));
}
export async function verifyBundle(root) {
  const m = JSON.parse(await safeRead(root, "manifest.json"));
  if (
    m.channel !== "web" ||
    m.content_kind !== "long_form" ||
    m.requested_action !== "review_only" ||
    m.schema_version !== 1
  )
    throw Error(
      "Expected reviewed web bundle; this does not authorise publication",
    );
  if (
    !slugPattern.test(m.content_id) ||
    !Array.isArray(m.artifacts) ||
    m.artifacts.length > 64
  )
    throw Error("Invalid web manifest");
  const url = new URL(m.canonical_url);
  if (
    url.origin !== "https://cjski.dev" ||
    !/^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/.test(url.pathname) ||
    url.search ||
    url.hash
  )
    throw Error("Unexpected canonical destination");
  const slug = url.pathname.split("/")[2],
    files = new Map();
  for (const a of m.artifacts) {
    if (files.has(a.path)) throw Error("Duplicate artifact");
    const bytes = await safeRead(root, a.path);
    if (sha(bytes) !== a.sha256)
      throw Error("Artifact hash mismatch: " + a.path);
    files.set(a.path, bytes);
  }
  const digest = digestManifest(m);
  const checks = {
    cmo: ["audience_fit", "seo_metadata", "useful_visuals", "channel_scope"],
    "qa-auditor": ["evidence", "privacy", "assets", "rendering"],
    default: ["independent_reviews", "revision_match", "requested_action"],
  };
  for (const [reviewer, required] of Object.entries(checks)) {
    const r = JSON.parse(await safeRead(root, m.reviews?.[reviewer]));
    if (
      r.reviewer_profile !== reviewer ||
      r.bundle_digest !== digest ||
      r.result !== "PASS" ||
      !r.summary ||
      !required.every((k) => r.checks?.[k] === true) ||
      Object.values(r.checks).some((v) => v !== true)
    )
      throw Error("Missing or stale " + reviewer + " review");
  }
  const source = files.get("source.md")?.toString("utf8");
  if (!source) throw Error("source.md required");
  const front = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!front) throw Error("Source metadata required");
  const meta = parse(front[1], { maxAliasCount: 0, uniqueKeys: true });
  if (
    typeof meta.title !== "string" ||
    meta.title.length > 160 ||
    typeof meta.description !== "string" ||
    meta.description.length > 240 ||
    meta.fixture === true
  )
    throw Error("Invalid article metadata");
  if (
    !["rendered", "evidence"].every((kind) =>
      m.artifacts.some((a) => a.kind === kind && files.get(a.path)?.length > 0),
    )
  )
    throw Error("Long-form needs rendered output and evidence artifacts");
  const assets = m.artifacts.filter((a) => a.kind === "visual");
  if (!assets.length) throw Error("Long-form needs a reviewed visual");
  const prose = source
    .slice(front[0].length)
    .replace(/```[^\n]*\n[\s\S]*?```/g, "");
  const embeddedFigures = [...prose.matchAll(/!\[([^\]]+)\]\(([^)]+)\)/g)];
  if (
    !embeddedFigures.some(
      (match) =>
        match[1].trim() && assets.some((asset) => asset.path === match[2]),
    )
  )
    throw Error("Article body must include a reviewed explanatory figure");

  for (const a of assets) {
    if (
      !/^assets\/[a-zA-Z0-9_-]+\.(png|webp|jpe?g|svg)$/.test(a.path) ||
      !a.alt ||
      !a.caption
    )
      throw Error("Invalid visual metadata");
    if (
      a.path.endsWith(".svg") &&
      /<!DOCTYPE|<!ENTITY|<(?:[\w.-]+:)?(?:script|foreignObject|animate|set|iframe)\b|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?!#)|@import|javascript:|expression\(|url\(\s*["']?(?!#)/i.test(
        files.get(a.path).toString(),
      )
    )
      throw Error("Active or externally linked SVG rejected");
  }
  return {
    manifest: m,
    digest,
    slug,
    meta,
    source,
    files,
    assets,
    manifestHash: sha(await safeRead(root, "manifest.json")),
  };
}
export function releaseIdentity(record) {
  const { approval, ...payload } = record;
  return sha(canonical(payload));
}
export function verifyApproval(record, approval) {
  if (
    approval?.action !== (record.action || "publish_web") ||
    approval.request_digest !== releaseIdentity(record) ||
    !/^founder_telegram:\d+$/.test(approval.approved_by) ||
    !Number.isSafeInteger(approval.message_id) ||
    approval.message_id <= 0 ||
    !Number.isFinite(Date.parse(approval.approved_at))
  )
    throw Error("Explicit exact-revision website approval required");
}

export async function rendererDigest(repo) {
  const { readdir } = await import("node:fs/promises");
  const entries = [];
  async function collect(folder) {
    for (const item of await readdir(path.join(repo, folder), {
      withFileTypes: true,
    })) {
      if (
        item.name.startsWith(".") ||
        item.name === "node_modules" ||
        item.name.endsWith(".md")
      )
        continue;
      const relative = folder + "/" + item.name;
      if (item.isSymbolicLink()) throw Error("Renderer symlink rejected");
      if (item.isDirectory()) await collect(relative);
      else
        entries.push([
          relative,
          sha(await readFile(path.join(repo, relative))),
        ]);
    }
  }
  await collect("blog");
  await collect("scripts/blog");
  for (const p of [
    "package.json",
    "package-lock.json",
    "src/styles/globals.css",
    "src/lib/site.ts",
    "public/static/avatar.png",
  ])
    entries.push([p, sha(await readFile(path.join(repo, p)))]);
  return sha(
    canonical(entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))),
  );
}

export function publicApproval(record, approval) {
  verifyApproval(record, approval);
  return {
    action: record.action || "publish_web",
    request_digest: approval.request_digest,
    approved_at: approval.approved_at,
    decision_digest: sha(canonical(approval)),
  };
}
export function verifyPublicApproval(record) {
  const a = record.approval;
  if (
    a?.action !== (record.action || "publish_web") ||
    a.request_digest !== releaseIdentity(record) ||
    !/^[a-f0-9]{64}$/.test(a.decision_digest || "") ||
    !Number.isFinite(Date.parse(a.approved_at)) ||
    "approved_by" in a ||
    "message_id" in a
  )
    throw Error("Invalid or privacy-unsafe public approval receipt");
}
