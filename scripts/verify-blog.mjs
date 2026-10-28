import {
  mkdtemp,
  mkdir,
  copyFile,
  symlink,
  writeFile,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
const root = process.cwd(),
  temp = await mkdtemp(path.join(tmpdir(), "cold-boot-archive-")),
  port = Number(process.env.BLOG_ARCHIVE_TEST_PORT || 3116),
  base = "http://127.0.0.1:" + port;
let server, browser;
try {
  const tracked = spawnSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { encoding: "utf8" },
  );
  if (tracked.status !== 0) throw Error("Cannot collect clean source inputs");
  for (const file of new Set(tracked.stdout.split("\0").filter(Boolean))) {
    await mkdir(path.dirname(path.join(temp, file)), { recursive: true });
    await copyFile(path.join(root, file), path.join(temp, file));
  }
  await symlink(
    path.join(root, "node_modules"),
    path.join(temp, "node_modules"),
    "dir",
  );
  const fixtures = Array.from({ length: 13 }, (_, i) => ({
    slug: "synthetic-note-" + (i + 1),
    title: `Synthetic field note ${String(i + 1).padStart(2, "0")}`,
    description: "Isolated archive test content. Never a real publication.",
    publishedAt: new Date(Date.UTC(2026, 0, 13 - i)).toISOString(),
    draft: false,
    fixture: false,
    publicationAuthorised: true,
    tags: [i % 2 ? "self-hosting" : "local-ai"],
    readingTime: 4,
    cover: { url: "/static/share.png", alt: "Synthetic card test" },
  }));
  await writeFile(
    path.join(temp, "content/articles.json"),
    JSON.stringify(fixtures),
  );
  server = spawn(
    process.execPath,
    [
      path.join(root, "node_modules/next/dist/bin/next"),
      "dev",
      "--webpack",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    { cwd: temp, stdio: ["ignore", "pipe", "pipe"] },
  );
  let logs = "";
  server.stdout.on("data", (x) => (logs += x));
  server.stderr.on("data", (x) => (logs += x));
  for (let i = 0; i < 120; i++) {
    if (server.exitCode !== null)
      throw Error("Fixture server exited: " + logs.slice(-500));
    try {
      if ((await fetch(base + "/blog")).ok) break;
    } catch {}
    if (i === 119) throw Error("Fixture server timeout: " + logs.slice(-2200));
    await new Promise((r) => setTimeout(r, 300));
  }
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base + "/blog");
    await page.waitForLoadState("networkidle");
    assert.equal(await page.locator(".blog-index-card").count(), 12);
    const footerGap = await page.evaluate(
      () =>
        document.querySelector(".site-footer").getBoundingClientRect().top -
        document.querySelector(".blog-newsletter").getBoundingClientRect()
          .bottom,
    );
    assert.ok(footerGap >= 48, `Newsletter/footer gap too small: ${footerGap}`);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    assert.equal(await page.locator(".blog-pagination a").count(), 2);
    const violations = (
      await new AxeBuilder({ page }).analyze()
    ).violations.filter((x) => ["serious", "critical"].includes(x.impact));
    assert.deepEqual(
      violations.map((x) => ({
        id: x.id,
        nodes: x.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
      [],
    );
    await page.screenshot({
      path: path.join(tmpdir(), "cjski-blog-cards-" + width + ".png"),
      fullPage: true,
    });
    await page
      .getByRole("searchbox", { name: "Search articles" })
      .fill("note 13");
    assert.equal(await page.locator(".blog-index-card").count(), 1);
    await page
      .getByRole("searchbox", { name: "Search articles" })
      .fill("does-not-exist");
    assert.equal(await page.locator(".blog-index-card").count(), 0);
    await page.getByRole("button", { name: "Clear filters" }).click();
    await page
      .getByRole("button", { name: "Self hosting", exact: true })
      .click();
    assert.equal(await page.locator(".blog-index-card").count(), 6);
    await page.getByRole("button", { name: "All topics", exact: true }).click();
    const response = await page.goto(base + "/blog/page/2");
    assert.equal(response.status(), 200);
    assert.equal(await page.locator(".blog-index-card").count(), 1);
    assert.equal(
      await page.locator("link[rel=canonical]").getAttribute("href"),
      "https://cjski.dev/blog/page/2",
    );
    assert.equal(
      await page.locator(".blog-pagination [aria-current=page]").innerText(),
      "2",
    );
  }
  await page.goto(base + "/blog");
  await page.getByRole("button", { name: "Switch colour theme" }).click();
  await page.waitForFunction(() =>
    document.documentElement.classList.contains("dark"),
  );
  await page.screenshot({
    path: path.join(tmpdir(), "cjski-blog-cards-dark.png"),
    fullPage: true,
  });
  console.log(
    JSON.stringify({
      cards: 13,
      per_page: 12,
      viewports: [390, 1440],
      search: "PASS",
      topics: "PASS",
      pagination: "PASS",
      accessibility: "PASS",
      theme: "PASS",
      production_content_unchanged: true,
    }),
  );
} finally {
  if (browser) await browser.close();
  if (server) {
    server.kill("SIGTERM");
    await new Promise((r) => server.once("exit", r));
  }
  await rm(temp, { recursive: true, force: true });
}
