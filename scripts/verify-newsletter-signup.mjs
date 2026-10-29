import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const base = process.env.WEBSITE_REVIEW_URL || "http://127.0.0.1:3110";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
});
try {
  const page = await browser.newPage();
  // Never let this check create a subscriber, even if test code changes later.
  await page.route("https://subscribe-forms.beehiiv.com/**", (route) =>
    route.request().method() === "GET" ? route.continue() : route.abort(),
  );
  await mkdir("docs/website/screenshots", { recursive: true });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const path of ["/newsletter", "/blog"]) {
      await page.goto(base + path);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("script[data-beehiiv-form]")).toHaveAttribute(
        "src",
        "https://subscribe-forms.beehiiv.com/v3/loader.js",
      );
      const iframe = page.getByTitle("Subscribe to Cold Boot", { exact: true });
      await iframe.scrollIntoViewIfNeeded();
      const form = page.frameLocator('iframe[title="Subscribe to Cold Boot"]');
      await expect(form.locator('input[type="email"]')).toBeVisible({
        timeout: 20000,
      });
      await expect(
        form.getByRole("button", { name: /Subscribe/ }),
      ).toBeVisible();
      expect(
        await form
          .locator('input[type="email"]')
          .evaluate((e) => e.required && !e.checkValidity()),
      ).toBeTruthy();
      await form.locator('input[type="email"]').fill("not-an-email");
      expect(
        await form
          .locator('input[type="email"]')
          .evaluate((e) => e.checkValidity()),
      ).toBeFalsy();
      await form.locator('input[type="email"]').fill("");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      for (const theme of ["light", "dark"]) {
        await page.evaluate(
          (d) =>
            document.documentElement.classList.toggle("dark", d === "dark"),
          theme,
        );
        await page.locator(".blog-newsletter").screenshot({
          path: `docs/website/screenshots/signup-${path.slice(1)}-${width}-${theme}.png`,
        });
      }
    }
  }
  await page.goto(base);
  await expect(page.locator(".newsletter-card")).toHaveAttribute(
    "href",
    "/newsletter",
  );
  // Exercise the SPA route transitions, including leaving before config loads.
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const destination of ["/newsletter", "/blog", "/newsletter"]) {
    await page
      .locator('.site-header a[href="' + destination + '"]')
      .first()
      .click();
    await page.waitForURL(base + destination);
    await expect(page.locator(".newsletter-signup iframe")).toHaveCount(1, {
      timeout: 20000,
    });
    await expect(
      page.getByTitle("Subscribe to Cold Boot", { exact: true }),
    ).toBeVisible();
    expect(await page.locator("script[data-beehiiv-form]").count()).toBe(1);
  }
  expect(errors).toEqual([]);
  // The fallback remains usable when an extension blocks the external form.
  await page.route("https://subscribe-forms.beehiiv.com/**", (route) =>
    route.abort(),
  );
  await page.goto(base + "/newsletter");
  await expect(
    page.getByRole("link", { name: "Form not loading? Subscribe on Beehiiv." }),
  ).toHaveAttribute("href", "https://cjski.beehiiv.com/subscribe");
  console.log(
    "Inline signup loads on newsletter and archive at mobile/desktop widths; email validation and blocked-frame fallback passed. No subscription submitted.",
  );
} finally {
  await browser.close();
}
