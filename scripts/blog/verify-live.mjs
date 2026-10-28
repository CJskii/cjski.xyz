import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
const entries = JSON.parse(await readFile("content/articles.json", "utf8"));
const origin = process.env.WEBSITE_VERIFY_ORIGIN || "https://cjski.dev";
if (new URL(origin).origin !== origin || !origin.startsWith("https://"))
  throw Error("Invalid production origin");
const expectedWithdrawn = JSON.parse(
  await readFile(".generated/blog/withdrawn.json", "utf8"),
);
const deadline = Date.now() + (process.argv.includes("--wait") ? 10 * 60e3 : 0);
async function check() {
  const marker = await fetch(origin + "/blog/release.json", {
    headers: { "Cache-Control": "no-cache" },
    signal: AbortSignal.timeout(15000),
  });
  if (!marker.ok) throw Error("Deployment release marker unavailable");
  const live = await marker.json();
  for (const item of expectedWithdrawn) {
    if (
      !live.withdrawn?.some(
        (w) => w.slug === item.slug && w.request_digest === item.request_digest,
      ) ||
      live.articles?.some((a) => a.slug === item.slug)
    )
      throw Error("Withdrawal not deployed yet");
    const removed = await fetch(origin + "/blog/" + item.slug, {
      signal: AbortSignal.timeout(15000),
    });
    if (![404, 410].includes(removed.status))
      throw Error("Withdrawn article still visible");
    for (const endpoint of ["/rss.xml", "/sitemap.xml"]) {
      const response = await fetch(origin + endpoint, {
        signal: AbortSignal.timeout(15000),
      });
      if (
        !response.ok ||
        (await response.text()).includes(origin + "/blog/" + item.slug)
      )
        throw Error("Withdrawn article still in discovery");
    }
  }
  for (const entry of entries) {
    if (
      !live.articles?.some(
        (a) =>
          a.slug === entry.slug &&
          a.bundle_digest === entry.bundleDigest &&
          a.renderer_digest === entry.rendererDigest,
      )
    )
      throw Error("Expected article revision is not deployed yet");
    const url = origin + "/blog/" + entry.slug;
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) }),
      html = await r.text();
    if (
      !r.ok ||
      !html.includes(entry.title.replaceAll("&", "&amp;")) ||
      !html.includes('rel="canonical"') ||
      /noindex/.test(html)
    )
      throw Error("Public article verification failed");
    for (const asset of entry.assets || []) {
      const image = await fetch(origin + asset.url, {
        signal: AbortSignal.timeout(15000),
      });
      if (!image.ok) throw Error("Public asset missing");
      const bytes = Buffer.from(await image.arrayBuffer());
      if (createHash("sha256").update(bytes).digest("hex") !== asset.sha256)
        throw Error("Public asset hash mismatch");
    }
    for (const endpoint of ["/rss.xml", "/sitemap.xml"]) {
      const x = await fetch(origin + endpoint, {
        signal: AbortSignal.timeout(15000),
      });
      if (!x.ok || !(await x.text()).includes(url))
        throw Error("Public discovery missing article");
    }
  }
}
for (;;) {
  try {
    await check();
    break;
  } catch (e) {
    if (Date.now() >= deadline) throw e;
    await new Promise((resolve) => setTimeout(resolve, 15000));
  }
}
const changed = new Set();
if (process.argv.includes("--changed-only")) {
  const diff = spawnSync(
    "git",
    [
      "diff",
      "--name-only",
      "HEAD^",
      "HEAD",
      "--",
      "content/blog/releases",
      "content/blog/withdrawals",
    ],
    { encoding: "utf8" },
  );
  if (diff.status !== 0) throw Error("Unable to identify changed releases");
  for (const file of diff.stdout.trim().split("\n"))
    if (
      file.startsWith("content/blog/releases/") ||
      file.startsWith("content/blog/withdrawals/")
    )
      changed.add(file.split("/")[3].replace(/\.json$/, ""));
}
for (const entry of entries) {
  if (process.argv.includes("--changed-only") && !changed.has(entry.slug))
    continue;
  const url = origin + "/blog/" + entry.slug;
  console.log(
    JSON.stringify({
      status: "verified_public",
      url,
      bundle_digest: entry.bundleDigest,
    }),
  );
  const token = process.env.TELEGRAM_CONTENT_TOKEN,
    chat = process.env.TELEGRAM_FOUNDER_CHAT_ID;
  if (token && chat) {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chat,
        text: `Website publication verified\n\n${entry.title}\n${url}`,
        reply_markup: { inline_keyboard: [[{ text: "Read article", url }]] },
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) throw Error("Publication verified, but Telegram receipt failed");
  }
}

for (const item of expectedWithdrawn) {
  if (process.argv.includes("--changed-only") && !changed.has(item.slug))
    continue;
  const token = process.env.TELEGRAM_CONTENT_TOKEN,
    chat = process.env.TELEGRAM_FOUNDER_CHAT_ID;
  if (token && chat) {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chat,
          text: `Article unpublished\n\n${item.slug.replaceAll("-", " ")}\nRemoved from the website, archive and feeds. Git source history is retained.`,
        }),
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!response.ok) throw Error("Removal verified but notification failed");
  }
  console.log(
    JSON.stringify({ status: "verified_unpublished", slug: item.slug }),
  );
}
