import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { releaseIdentity } from "./contracts.mjs";
const draft = process.argv[2];
if (!draft) throw Error("Private draft directory required");
const record = JSON.parse(
  await readFile(path.join(draft, "request.json"), "utf8"),
);
const child = spawn(process.execPath, ["scripts/blog/serve-preview.mjs"], {
  env: { ...process.env, BLOG_PREVIEW_PORT: "0" },
  stdio: ["ignore", "pipe", "pipe"],
});
let browser;
try {
  const base = await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(Error("Preview server timeout")),
      10000,
    );
    child.stdout.on("data", (chunk) => {
      const match = chunk.toString().match(/http:\/\/127\.0\.0\.1:\d+[^\s]*/);
      if (match) {
        clearTimeout(timer);
        resolve(match[0].replace(/\/SLUG$/, ""));
      }
    });
    child.once("exit", () => {
      clearTimeout(timer);
      reject(Error("Preview server exited"));
    });
  });
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  });
  const checks = [];
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 950 },
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.name));
    const r = await page.goto(base + "/" + record.slug);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((i) => i.decode()));
    });
    const avatar = page.locator(".blog-article-author img");
    if (
      (await avatar.count()) !== 1 ||
      !(await avatar.evaluate(
        (img) => img.complete && img.naturalWidth > 0 && !!img.alt,
      ))
    )
      throw Error("Author picture is missing or failed to load");
    const share = page.getByRole("button", {
      name: "Share article",
      exact: true,
    });
    const copy = page.getByRole("button", { name: "Copy link", exact: true });
    if (!(await share.isVisible()) || !(await copy.isVisible()))
      throw Error("Article sharing controls missing");
    const result = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      images: [...document.images].every(
        (i) => i.complete && i.naturalWidth > 0 && i.alt,
      ),
      canonical: document.querySelector("link[rel=canonical]")?.href,
      noindex: document
        .querySelector("meta[name=robots]")
        ?.content.includes("noindex"),
      h1: document.querySelectorAll("h1").length,
      figureSources: [...document.querySelectorAll(".article-body img")].map(
        (img) => ({
          src: img.getAttribute("src"),
          currentSrc: img.currentSrc,
        }),
      ),
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content,
      articleSchema: [
        ...document.querySelectorAll('script[type="application/ld+json"]'),
      ].some((script) => {
        try {
          const data = JSON.parse(script.textContent);
          return (data["@graph"] || [data]).some((node) =>
            ["Article", "TechArticle", "BlogPosting"].includes(node["@type"]),
          );
        } catch {
          return false;
        }
      }),
    }));
    if (
      r.status() !== 200 ||
      result.overflow ||
      !result.images ||
      result.h1 !== 1 ||
      !result.title.includes(record.title) ||
      result.description !== record.description ||
      !result.articleSchema ||
      !result.noindex ||
      result.canonical !== record.canonical_url.replace(/\/$/, "") ||
      errors.length
    )
      throw Error("Rendered preview check failed at " + width);
    if (width <= 1050) {
      for (const image of result.figureSources) {
        const name = path.basename(image.src || "");
        const mobileName = name.replace(/(?:-desktop)?\.svg$/, "-mobile.svg");
        if (
          record.assets.some((a) => path.basename(a.path) === mobileName) &&
          !image.currentSrc.endsWith("/" + mobileName)
        )
          throw Error(
            "Phone preview did not load the reviewed mobile figure: " + name,
          );
      }
    }
    await page.screenshot({
      path: path.join(draft, "preview-" + width + ".png"),
      fullPage: true,
    });
    const accessibility = [];
    for (const mode of ["light", "dark"]) {
      if (mode === "dark") {
        await page.getByRole("button", { name: "Switch colour theme" }).click();
        if (
          !(await page.evaluate(() =>
            document.documentElement.classList.contains("dark"),
          ))
        )
          throw Error("Theme control failed");
      }
      const violations = (
        await new AxeBuilder({ page }).analyze()
      ).violations.filter((v) => ["serious", "critical"].includes(v.impact));
      if (violations.length)
        throw Error(
          JSON.stringify({
            width,
            mode,
            accessibility: violations.map((v) => ({
              id: v.id,
              nodes: v.nodes.map((n) => n.target),
            })),
          }),
        );
      accessibility.push({ mode, violations: 0 });
      if (mode === "dark")
        await page.screenshot({
          path: path.join(draft, "preview-" + width + "-dark.png"),
          fullPage: true,
        });
    }
    if (width === 390) {
      await page.getByRole("button", { name: "Menu", exact: true }).click();
      if (
        (await page
          .getByRole("button", { name: "Menu", exact: true })
          .getAttribute("aria-expanded")) !== "true"
      )
        throw Error("Mobile menu failed");
      await page.keyboard.press("Escape");
      if (
        (await page
          .getByRole("button", { name: "Menu", exact: true })
          .getAttribute("aria-expanded")) !== "false"
      )
        throw Error("Mobile menu escape failed");
    }
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.__copiedArticle = text;
          },
        },
      });
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: undefined,
      });
    });
    await copy.click();
    if (
      (await page.evaluate(() => window.__copiedArticle)) !==
      record.canonical_url
    )
      throw Error(
        "Copy link must use the public canonical, never the private preview",
      );
    await page.evaluate(() =>
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: async (data) => {
          window.__sharedArticle = data;
        },
      }),
    );
    await share.click();
    const shared = await page.evaluate(() => window.__sharedArticle);
    if (shared?.url !== record.canonical_url || shared?.title !== record.title)
      throw Error("Native share data mismatch");
    await page.evaluate(() => {
      window.__copiedArticle = null;
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: async () => {
          throw new DOMException("Cancelled", "AbortError");
        },
      });
    });
    await share.click();
    if ((await page.evaluate(() => window.__copiedArticle)) !== null)
      throw Error("Cancelling native share must not copy unexpectedly");
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async () => {
            throw Error("Clipboard denied");
          },
        },
      }),
    );
    await copy.click();
    const manual = page.getByRole("textbox", {
      name: "Article link",
      exact: true,
    });
    if (
      !(await manual.isVisible()) ||
      (await manual.inputValue()) !== record.canonical_url
    )
      throw Error("Clipboard denial needs a manual copy fallback");
    checks.push({
      width,
      ...result,
      errors,
      accessibility,
      author_avatar: true,
      sharing: {
        canonical_copy: true,
        native_share: true,
        cancelled_share: true,
        manual_fallback: true,
      },
    });
    await context.close();
  }
  const review = {
    request_digest: releaseIdentity(record),
    renderer_digest: record.renderer_digest,
    result: "PASS",
    method: "Playwright Chromium",
    checked_at: new Date().toISOString(),
    checks,
  };
  await writeFile(
    path.join(draft, "render-review.json"),
    JSON.stringify(review, null, 2),
    { mode: 0o600 },
  );
  console.log(JSON.stringify({ render_review: "PASS", widths: [390, 1440] }));
} finally {
  if (browser) await browser.close();
  child.kill("SIGTERM");
}
