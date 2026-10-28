import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm, mkdir, stat, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import responsiveFigures from "../scripts/blog/responsive-figures.mjs";

test("ordinary and explicit desktop figure names select only documented mobile variants", async (t) => {
  const folder = await mkdtemp(path.join(tmpdir(), "blog-responsive-"));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const cataloguePath = path.join(folder, "catalogue.json");
  const urls = [
    "/blog/media/lab.svg",
    "/blog/media/lab-mobile.svg",
    "/blog/media/route-desktop.svg",
    "/blog/media/route-mobile.svg",
    "/blog/media/standalone.svg",
  ];
  await writeFile(
    cataloguePath,
    JSON.stringify([{ assets: urls.map((url) => ({ url })) }]),
  );
  const img = (src) => ({
    type: "element",
    tagName: "img",
    properties: { src, alt: "Meaningful diagram" },
    children: [],
  });
  const tree = {
    type: "root",
    children: [img(urls[0]), img(urls[2]), img(urls[4])],
  };
  responsiveFigures({ cataloguePath })(tree);
  for (const [i, mobile] of [
    [0, urls[1]],
    [1, urls[3]],
  ]) {
    assert.equal(tree.children[i].tagName, "picture");
    assert.equal(tree.children[i].children[0].properties.srcSet, mobile);
    assert.equal(
      tree.children[i].children[0].properties.media,
      "(max-width: 1050px)",
    );
    assert.equal(
      tree.children[i].children[1].properties.alt,
      "Meaningful diagram",
    );
  }
  assert.equal(tree.children[2].tagName, "img");
});

test("restricted-umask builds export readable static files while private drafts stay private", async (t) => {
  const { readableStaticOutput } =
    await import("../scripts/blog/static-permissions.mjs");
  const root = await mkdtemp(path.join(tmpdir(), "blog-static-mode-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const out = path.join(root, "dist");
  await mkdir(path.join(out, "article"), { recursive: true, mode: 0o700 });
  const html = path.join(out, "article/index.html");
  const privateFile = path.join(root, "private-source.md");
  await writeFile(html, "<h1>Compiled preview</h1>", { mode: 0o600 });
  await writeFile(privateFile, "Private source", { mode: 0o600 });
  await readableStaticOutput(out);
  assert.equal((await stat(html)).mode & 0o777, 0o644);
  assert.equal((await stat(path.dirname(html))).mode & 0o777, 0o755);
  assert.equal((await stat(privateFile)).mode & 0o777, 0o600);
  await symlink(privateFile, path.join(out, "unexpected-link"));
  await assert.rejects(readableStaticOutput(out), /symlink rejected/);
  assert.equal((await stat(privateFile)).mode & 0o777, 0o600);
});

test("private draft schema never invents a publication date", async () => {
  const { generateJsonLdGraph } = await import("../blog/src/lib/seo.ts");
  const base = {
    slug: "example",
    title: "Example",
    description: "Example description",
    publishedAt: new Date("2026-01-01T12:00:00Z"),
  };
  const make = (data) =>
    generateJsonLdGraph({
      post: { data },
      canonicalUrl: "https://cjski.dev/blog/example",
      siteOrigin: "https://cjski.dev",
    })["@graph"].find((n) => n["@type"] === "TechArticle");
  for (const extra of [
    { draft: true, publicationAuthorised: false },
    { draft: false, noindex: true, publicationAuthorised: true },
    { draft: false, publicationAuthorised: false },
  ]) {
    const article = make({ ...base, ...extra });
    assert.equal(article.datePublished, undefined);
    assert.equal(article.dateModified, undefined);
  }
  const published = make({
    ...base,
    draft: false,
    publicationAuthorised: true,
  });
  assert.equal(published.datePublished, "2026-01-01T12:00:00.000Z");
});
