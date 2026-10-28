import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
const out = new URL("../docs/website/screenshots", import.meta.url).pathname;
const base = process.env.WEBSITE_REVIEW_URL || "http://127.0.0.1:3100";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const results = [];
const errors = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push({ width, message: e.message }));
    for (const [name, path] of [
      ["home", "/"],
      ["article", "/review/local-model-worker-cloud-fallback"],
      ["projects", "/projects"],
      ["lab", "/lab"],
      ["etherway", "/projects/1"],
      ["contracts", "/contracts"],
      ["author", "/authors/cjskii"],
      ["newsletter", "/newsletter"],
    ]) {
      const response = await page.goto(base + path);
      await page.locator("#main-content").waitFor();
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          [...document.images].map((image) => {
            image.loading = "eager";
            return image.decode().catch(() => {});
          }),
        );
      });
      const check = await page.evaluate(() => ({
        title: document.title,
        h1: document.querySelectorAll("h1").length,
        overflow: document.documentElement.scrollWidth > innerWidth,
        images: [...document.images].map((i) => ({
          src: i.currentSrc,
          loaded: i.complete && i.naturalWidth > 0,
        })),
        canonical: document.querySelector("link[rel=canonical]")?.href,
      }));
      if (
        response.status() !== 200 ||
        check.h1 !== 1 ||
        check.overflow ||
        check.images.some((i) => !i.loaded)
      )
        throw new Error(
          JSON.stringify({ name, width, status: response.status(), ...check }),
        );
      if (name === "home" || name === "article")
        await page.screenshot({
          path: `${out}/${name}-${width}.png`,
          fullPage: true,
        });
      const accessibility = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      if (accessibility.violations.length)
        throw new Error(
          JSON.stringify({
            name,
            width,
            accessibility: accessibility.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              nodes: v.nodes.map((n) => ({
                target: n.target,
                summary: n.failureSummary,
              })),
            })),
          }),
        );
      results.push({
        name,
        width,
        status: response.status(),
        accessibilityViolations: 0,
        ...check,
      });
    }
    if (width === 390) {
      await page.goto(base + "/");
      await page.getByRole("button", { name: /Menu/ }).focus();
      await page.keyboard.press("Enter");
      await page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: "About", exact: true })
        .click();
      await page.waitForURL(/\/about\/?$/);
      await page.getByRole("button", { name: /Menu/ }).click();
      await page.keyboard.press("Escape");
      if (
        (await page
          .getByRole("button", { name: /Menu/ })
          .getAttribute("aria-expanded")) !== "false"
      )
        throw new Error("Escape did not close menu");
    }
    await page.goto(base + "/projects");
    if ((await page.locator(".project-grid > article").count()) !== 9)
      throw new Error("Curated projects missing");
    if ((await page.locator(".project-grid img").count()) !== 9)
      throw new Error("Every curated project needs an image");
    if (
      /Waldo|CV Generator|Battleship|Memory Card/i.test(
        await page.locator("main").innerText(),
      )
    )
      throw new Error("Exercise projects leaked into curated index");
    await page.goto(base + "/contracts");
    await page
      .getByRole("button", { name: "Go to next page", exact: true })
      .click();
    await page.getByText("Page 2 of 20", { exact: true }).waitFor();
    await page
      .getByRole("button", { name: "Go to previous page", exact: true })
      .click();
    await page.getByText("Page 1 of 20", { exact: true }).waitFor();
    const sort = page.getByRole("button", { name: "Chain Name", exact: true });
    await sort.click();
    if ((await sort.locator("..").getAttribute("aria-sort")) !== "ascending")
      throw new Error("Ascending table sort failed");
    await sort.click();
    if ((await sort.locator("..").getAttribute("aria-sort")) !== "descending")
      throw new Error("Descending table sort failed");
    await page.getByLabel("Filter by chain name").fill("Arbitrum");
    await page.waitForTimeout(150);
    const rows = await page.locator("tbody tr").allTextContents();
    if (!rows.length || rows.some((t) => !t.includes("Arbitrum")))
      throw new Error("Contracts filter failed " + JSON.stringify(rows));
    await page.getByLabel("Filter by chain name").fill("no-such-chain");
    await page.getByText("No results.", { exact: true }).waitFor();
    const keyboardPage = await context.newPage();
    await keyboardPage.goto(base + "/");
    await keyboardPage.locator("#main-content").waitFor();
    await keyboardPage.bringToFront();
    await keyboardPage.keyboard.press("Tab");
    if (
      (await keyboardPage.locator(":focus").textContent()) !== "Skip to content"
    )
      throw new Error("Keyboard skip link missing");
    await keyboardPage.keyboard.press("Enter");
    if (
      (await keyboardPage.locator(":focus").getAttribute("id")) !==
      "main-content"
    )
      throw new Error("Skip link target not focused");
    await keyboardPage.close();
    await page.bringToFront();
    await page.goto(base + "/");
    await page.getByRole("button", { name: "Switch colour theme" }).click();
    for (const [name, path] of [
      ["home", "/"],
      ["article", "/review/local-model-worker-cloud-fallback"],
      ["contracts", "/contracts"],
      ["lab-dark", "/lab"],
      ["gpu-dark", "/lab/local-inference"],
    ]) {
      await page.goto(base + path);
      await page.locator("#main-content").waitFor();
      if (
        !(await page
          .locator("html")
          .evaluate((el) => el.classList.contains("dark")))
      )
        throw new Error("Theme persistence failed");
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      if (axe.violations.length)
        throw new Error(
          JSON.stringify({
            name,
            width,
            theme: "dark",
            violations: axe.violations,
          }),
        );
      results.push({ name, width, theme: "dark", accessibilityViolations: 0 });
    }
    await page.goto(base + "/review/local-model-worker-cloud-fallback");
    await page
      .locator("picture")
      .screenshot({ path: `${out}/article-figure-${width}.png` });
    await context.close();
  }
  if (errors.length)
    throw new Error("Browser errors: " + JSON.stringify(errors));
  await writeFile(
    new URL("../docs/website/browser-results.json", import.meta.url),
    JSON.stringify(
      {
        results,
        errors,
        mobileMenu: "pass",
        projectCuration: "pass",
        contractsFilter: "pass",
        contractsSorting: "pass",
        contractsPagination: "pass",
        keyboardSkipLink: "pass",
        themePersistence: "pass",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    JSON.stringify({
      pages: results.length,
      errors: errors.length,
      screenshots: out,
    }),
  );
} finally {
  await browser.close();
}
