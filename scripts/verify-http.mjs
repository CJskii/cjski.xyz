import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
const publicBase =
  process.env.WEBSITE_PUBLIC_TEST_URL || "http://127.0.0.1:3101";
const reviewBase = process.env.WEBSITE_REVIEW_URL || "http://127.0.0.1:3100";
const checks = [];
async function request(base, path, status, headers = {}) {
  const response = await fetch(base + path, { headers });
  assert.equal(response.status, status, `${base}${path}`);
  checks.push({
    path,
    status,
    environment: base === publicBase ? "ordinary production" : "local review",
  });
  return response;
}
for (const path of [
  "/",
  "/projects",
  "/projects/1",
  "/lab",
  "/lab/home-lab",
  "/lab/local-inference",
  "/lab/home-assistant",
  "/lab/agent-organisation",
  "/projects/13",
  "/contracts",
  "/blog",
  "/about",
  "/authors/cjskii",
  "/newsletter",
  "/contact",
  "/manifest.json",
  "/favicon.svg",
  "/static/share.png",
])
  await request(publicBase, path, 200);
for (const path of [
  "/example",
  "/lab/content-system",
  "/projects/999",
  "/lab/unknown-experiment",
  "/projects/01",
  "/projects/this-project-does-not-exist",
  "/missing",
  "/blog/local-model-worker-cloud-fallback",
  "/review/local-model-worker-cloud-fallback",
  "/api/review/media?file=availability-desktop.svg",
  "/content/private/local-model-worker-cloud-fallback/source.md",
])
  await request(publicBase, path, 404);
await request(publicBase, "/api/moralis/last-transaction", 410);
const privateResponse = await request(
  reviewBase,
  "/review/local-model-worker-cloud-fallback",
  200,
);
assert.match(privateResponse.headers.get("x-robots-tag"), /noindex/);
assert.match(privateResponse.headers.get("cache-control"), /no-store/);
const privateBody = await privateResponse.text();
assert.match(
  privateBody.replace(/<!--[\s\S]*?-->/g, ""),
  /Content revision v3/,
);
assert.match(privateBody, /name="robots" content="noindex,nofollow,noarchive"/);
for (const header of ["x-forwarded-for", "x-forwarded-host", "forwarded"])
  await request(reviewBase, "/review/local-model-worker-cloud-fallback", 404, {
    [header]: "127.0.0.1",
  });
await request(reviewBase, "/review/unknown", 404);
await request(reviewBase, "/api/review/media?file=../../source.md", 404);
for (const file of ["availability-desktop.svg", "availability-mobile.svg"]) {
  const media = await request(
    reviewBase,
    `/api/review/media?file=${file}`,
    200,
  );
  assert.match(media.headers.get("content-type"), /image\/svg\+xml/);
  assert.match(media.headers.get("cache-control"), /no-store/);
}
const source = await readFile(
  new URL(
    "../content/private/local-model-worker-cloud-fallback/source.md",
    import.meta.url,
  ),
  "utf8",
);
const articleTitle = source.match(/title: "(.*?)"/)[1];
for (const path of [
  "/",
  "/blog",
  "/authors/cjskii",
  "/sitemap.xml",
  "/rss.xml",
]) {
  const response = await request(publicBase, path, 200);
  const body = await response.text();
  assert.ok(!body.includes(articleTitle), `Draft title leaked in ${path}`);
  assert.ok(
    !body.includes("availability-desktop.svg"),
    `Draft asset leaked in ${path}`,
  );
  assert.ok(!body.includes("cjski_web3"), `Stale handle in ${path}`);
  if (path.endsWith(".xml"))
    assert.ok(!body.includes("/review/"), `Preview URL leaked in ${path}`);
}
const metadata = [];
for (const path of ["/", "/projects/1", "/authors/cjskii", "/contact"]) {
  const html = await (await request(publicBase, path, 200)).text();
  assert.match(html, /<meta name="twitter:site" content="@cjski_"/);
  assert.equal((html.match(/name="viewport"/g) || []).length, 1);
  const canonical = html.match(/rel="canonical" href="(.*?)"/)[1];
  assert.equal(canonical, "https://cjski.dev" + path);
  metadata.push({ path, canonical });
}
await writeFile(
  new URL("../docs/website/http-results.json", import.meta.url),
  JSON.stringify(
    { checkedAt: new Date().toISOString(), checks, metadata },
    null,
    2,
  ) + "\n",
);
console.log(
  `${checks.length} HTTP checks passed; public draft exclusion and local preview boundaries verified.`,
);
