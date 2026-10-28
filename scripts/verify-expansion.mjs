import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const base = process.env.WEBSITE_PUBLIC_TEST_URL || "http://192.168.0.183:3101";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  args: ["--no-sandbox"],
});
const results = [];
const errors = [];
try {
  for (const width of [1440, 768, 710, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    for (const path of [
      "/",
      "/blog",
      "/newsletter",
      "/projects",
      "/lab",
      "/lab/home-lab",
      "/lab/local-inference",
      "/lab/home-assistant",
      "/lab/agent-organisation",
      "/contact",
      "/projects/1",
      "/projects/2",
      "/projects/4",
      "/projects/self-hosted-compose",
      "/projects/api-starter-auth",
      "/projects/finance-tracker",
      "/projects/tweet-fetcher",
      "/projects/tg-omnichain-mini-app",
    ]) {
      const response = await page.goto(base + path);
      await page.locator("#main-content").waitFor();
      const booking = page.locator(".booking-nav");
      assert.equal(await booking.getAttribute("href"), "https://cal.com/cjski");
      assert.equal(await booking.isVisible(), true);
      if (path === "/")
        assert.equal(
          await page
            .locator(".hero-actions a[href='https://cal.com/cjski']")
            .count(),
          1,
        );
      if (path === "/contact")
        assert.equal(
          await page.locator("main a[href='https://cal.com/cjski']").count(),
          1,
        );
      if (path === "/projects") {
        assert.equal(
          await page.locator(".portfolio-card-grid article").count(),
          9,
        );
        assert.equal(await page.locator(".portfolio-card-grid img").count(), 9);
        assert.doesNotMatch(
          await page.locator("main").innerText(),
          /Waldo|Battleship|CV Generator|Memory Card/i,
        );
      }

      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          [...document.images].map((image) => {
            image.loading = "eager";
            return image.decode().catch(() => {});
          }),
        );
      });
      assert.equal(response.status(), 200, path);
      const links = await page.locator("a[href]").evaluateAll((anchors) =>
        anchors.map((a) => ({
          href: a.getAttribute("href"),
          target: a.getAttribute("target"),
          rel: a.getAttribute("rel"),
        })),
      );
      for (const link of links) {
        if (/^https?:/.test(link.href)) {
          assert.equal(link.target, "_blank", link.href);
          assert.ok(link.rel?.includes("noopener"), link.href);
        } else if (
          link.href.startsWith("/") ||
          link.href.startsWith("#") ||
          link.href.startsWith("mailto:")
        ) {
          assert.notEqual(link.target, "_blank", link.href);
        }
      }
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `${path} overflows at ${width}`,
      );
      if (path === "/") {
        assert.equal(
          await page.locator(".selected-project-grid > article").count(),
          3,
        );
        for (const name of [
          "Token & prompt playground",
          "Finance Tracker",
          "Self-hosted Compose",
        ])
          assert.equal(
            await page
              .locator(".selected-project-grid")
              .getByRole("link", { name, exact: true })
              .count(),
            1,
          );
        assert.ok((await page.locator(".calendar-days > span").count()) >= 300);
        assert.equal(await page.locator(".github-commits li").count(), 3);
      }
      if (path === "/blog")
        await page
          .getByRole("status")
          .filter({ hasText: "Blog link coming soon." })
          .waitFor();
      if (path === "/newsletter") {
        const subscribe = page.getByRole("link", {
          name: "Subscribe",
          exact: true,
        });
        assert.equal(
          await subscribe.getAttribute("href"),
          "https://cjski.beehiiv.com/subscribe",
        );
        assert.equal(await subscribe.getAttribute("target"), "_blank");
        assert.equal(await page.locator("input[type=email]").count(), 0);
      }
      if (
        (width === 1440 || width === 390) &&
        ["/", "/blog", "/newsletter", "/projects", "/contact", "/lab"].includes(
          path,
        )
      )
        await page.screenshot({
          path: `docs/website/screenshots/${path === "/" ? "home" : path.slice(1)}-${width}.png`,
          fullPage: true,
        });
      results.push({ path, width, status: 200, overflow: false });
    }
    await page.goto(base + "/projects");
    const categories = page.getByRole("group", { name: "Project categories" });
    await categories
      .getByRole("button", { name: "Developer tools", exact: true })
      .click();
    assert.deepEqual(
      await page
        .locator(".portfolio-card-grid .project-card-heading :is(h2,h3)")
        .allTextContents(),
      ["API Starter", "Next Web3 Template"],
    );
    await page.getByLabel("Sort by").selectOption("oldest");
    assert.deepEqual(
      await page
        .locator(".portfolio-card-grid .project-card-heading :is(h2,h3)")
        .allTextContents(),
      ["Next Web3 Template", "API Starter"],
    );
    await page.getByLabel("Sort by").selectOption("newest");
    assert.deepEqual(
      await page
        .locator(".portfolio-card-grid .project-card-heading :is(h2,h3)")
        .allTextContents(),
      ["API Starter", "Next Web3 Template"],
    );
    await categories.getByRole("button", { name: "All", exact: true }).click();
    assert.equal(
      await page
        .locator(".portfolio-card-grid .project-card-heading :is(h2,h3)")
        .first()
        .innerText(),
      "API Starter",
    );
    await page.getByLabel("Sort by").selectOption("oldest");
    assert.equal(
      await page
        .locator(".portfolio-card-grid .project-card-heading :is(h2,h3)")
        .first()
        .innerText(),
      "Tweet Fetcher",
    );
    await page.getByLabel("Sort by").selectOption("featured");
    assert.equal(
      await page
        .locator(".portfolio-card-grid .project-card-heading :is(h2,h3)")
        .first()
        .innerText(),
      "Token & prompt playground",
    );
    assert.equal(await page.locator(".portfolio-card-grid article").count(), 9);
    await categories
      .getByRole("button", { name: "Applications", exact: true })
      .click();
    assert.deepEqual(
      await page
        .locator(".portfolio-card-grid .project-card-heading :is(h2,h3)")
        .allTextContents(),
      ["Etherway", "OmniMinter", "Telegram mini-app"],
    );
    await context.close();
  }
  for (const mode of ["unavailable", "malformed"]) {
    const page = await browser.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/api/github/activity", (route) =>
      mode === "unavailable"
        ? route.abort()
        : route.fulfill({
            status: 200,
            contentType: "application/json",
            body: '{"repos":[],"commits":[],"calendar":{"days":[]},"checkedAt":"invalid"}',
          }),
    );
    await page.goto(base);
    await page.locator("#main-content").waitFor();
    await page.waitForTimeout(300);
    assert.ok(
      (await page.locator(".calendar-days > span").count()) >= 300,
      `Calendar lost after ${mode} response`,
    );
    assert.equal(await page.locator(".github-commits li").count(), 3);
    await page.close();
  }
  assert.equal(errors.length, 0, JSON.stringify(errors));
  for (const path of [
    "/api/github/activity",
    "/api/github/latest-commit",
    "/api/github/pinned-repos",
  ])
    assert.equal((await fetch(base + path, { method: "POST" })).status, 405);
  const activity = await (await fetch(base + "/api/github/activity")).json();
  assert.ok(activity.repos.length > 0);
  assert.ok(activity.calendar.days.length >= 300);
  assert.ok(
    activity.commits.every((commit) =>
      commit.url.startsWith("https://github.com/CJskii/"),
    ),
  );
  await writeFile(
    "docs/website/expansion-results.json",
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        results,
        errors,
        upstreamFailureFallback: "pass",
        malformedResponseFallback: "pass",
        readOnlyApiMethods: "pass",
        placeholders: "pass",
        projectCategoryFilter: "pass",
        projectDateSorting: "pass",
        externalLinksNewTab: "pass",
        internalLinksSameTab: "pass",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `${results.length} production render checks passed; GitHub fallback, publication placeholders and API methods passed.`,
  );
} finally {
  await browser.close();
}
