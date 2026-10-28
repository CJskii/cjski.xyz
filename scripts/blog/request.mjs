import { randomBytes } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { releaseIdentity, rendererDigest } from "./contracts.mjs";
const [draft, previewUrl, registry] = process.argv.slice(2);
if (!draft || !previewUrl || !registry)
  throw Error(
    "Usage: request.mjs PRIVATE_DRAFT PROTECTED_PREVIEW_URL PRIVATE_REGISTRY",
  );
const record = JSON.parse(
  await readFile(path.join(draft, "request.json"), "utf8"),
);
if (record.renderer_digest !== (await rendererDigest(process.cwd())))
  throw Error("Renderer changed; reimport/review");
const withdrawing = record.action === "unpublish_web";
const url = new URL(previewUrl);
if (
  url.protocol !== "https:" ||
  !(
    withdrawing
      ? ["cjski.dev"]
      : ["preview.cjskii.duckdns.org", "blog-preview.cjskii.duckdns.org"]
  ).includes(url.hostname) ||
  url.username ||
  url.password ||
  url.port
)
  throw Error("Use the existing protected preview origin");
if (!withdrawing) {
  const review = JSON.parse(
    await readFile(path.join(draft, "render-review.json"), "utf8"),
  );
  if (
    review.result !== "PASS" ||
    review.request_digest !== releaseIdentity(record) ||
    review.renderer_digest !== record.renderer_digest ||
    Date.now() - Date.parse(review.checked_at) > 24 * 3600e3
  )
    throw Error("Fresh exact-render preview checks required");
}
const digest = releaseIdentity(record),
  id = randomBytes(16).toString("hex");
const request = {
  id,
  draft_directory: path.resolve(draft),
  requested_action: withdrawing ? "unpublish_web" : "publish_web",
  request_digest: digest,
  slug: record.slug,
  title: record.title,
  canonical_url: record.canonical_url,
  preview_url: previewUrl,
  created_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 24 * 3600e3).toISOString(),
};
await mkdir(registry, { recursive: true, mode: 0o700 });
await writeFile(
  path.join(registry, id + ".json"),
  JSON.stringify(request, null, 2),
  { mode: 0o600, flag: "wx" },
);
console.log(
  JSON.stringify({
    request_id: id,
    registry_file: path.join(registry, id + ".json"),
    message: {
      text: `Website ${withdrawing ? "unpublish" : "publication"} approval\n\n${record.title}\n\nDestination: ${record.canonical_url}\nRevision: ${record.source_revision}\nApprove publishes this exact article and images after checks. This is separate from any earlier preview review.`,
      reply_markup: {
        inline_keyboard: [
          [{ text: "Review article", url: previewUrl }],
          [
            {
              text: withdrawing
                ? "Approve unpublish"
                : "Approve website publication",
              callback_data: "web:approve:" + id,
            },
            {
              text: withdrawing ? "Keep published" : "Keep as draft",
              callback_data: "web:reject:" + id,
            },
          ],
        ],
      },
    },
  }),
);
