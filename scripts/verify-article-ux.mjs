import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const base =
  process.env.ARTICLE_REVIEW_URL ||
  "http://127.0.0.1:3102/blog/why-i-run-a-home-lab";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
});
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value) => {
          window.copiedLink = value;
        },
      },
    }),
  );
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    const links = page.locator(".article-toc a");
    const first = await links.first().getAttribute("href");
    await expect(links.first()).toHaveAttribute("aria-current", "location");
    for (const i of [2, 5, 1]) {
      const link = links.nth(Math.min(i, (await links.count()) - 1));
      const href = await link.getAttribute("href");
      await page.evaluate((id) => {
        document.getElementById(id).scrollIntoView({ block: "start" });
      }, href.slice(1));
      await expect(link).toHaveAttribute("aria-current", "location");
      await expect(page.locator(".article-toc a[aria-current]")).toHaveCount(1);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(links.first()).toHaveAttribute("aria-current", "location");
    await expect(page.locator(".blog-article-meta .article-share")).toHaveCount(
      1,
    );
    await page.getByRole("button", { name: "Copy link", exact: true }).click();
    await expect(page.locator("[data-status]")).toHaveText("Link copied.");
    expect(await page.evaluate(() => window.copiedLink)).toBe(
      "https://cjski.dev/blog/why-i-run-a-home-lab",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.goto(
      base + "#" + (await links.nth(2).getAttribute("href")).slice(1),
    );
    await expect(page.locator(".article-toc a[aria-current]")).toHaveAttribute(
      "href",
      new URL(page.url()).hash,
    );
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (d) => document.documentElement.classList.toggle("dark", d === "dark"),
        theme,
      );
      await page.evaluate(() => window.scrollTo(0, 0));
      await mkdir("docs/website/screenshots", { recursive: true });
      await page.screenshot({
        path: `docs/website/screenshots/article-ux-${width}-${theme}.png`,
        fullPage: true,
      });
    }
  }
  // Permission-denied clipboard still gives a usable manual-copy field.
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw Error("denied");
        },
      },
    }),
  );
  await page.getByRole("button", { name: "Copy link", exact: true }).click();
  await expect(page.getByLabel("Article link", { exact: true })).toBeVisible();
  await expect(
    page.locator('iframe[title="Subscribe to Cold Boot"]'),
  ).toHaveAttribute("src", /^https:\/\/subscribe-forms\.beehiiv\.com\//);
  console.log(
    "Article navigation, sharing, deep links and responsive layout passed.",
  );
} finally {
  await browser.close();
}
