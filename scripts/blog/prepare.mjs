import { readdir, readFile, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { stringify, parse } from "yaml";
import {
  safeRead,
  sha,
  verifyPublicApproval,
  rendererDigest,
  releaseIdentity,
  slugPattern,
} from "./contracts.mjs";
export async function prepare(repo = process.cwd(), previewDirectory = null) {
  const generated = path.join(repo, ".generated/blog");
  await rm(generated, { recursive: true, force: true });
  await mkdir(path.join(generated, "content"), { recursive: true });
  await mkdir(path.join(generated, "public/media"), { recursive: true });
  const releases = path.join(repo, "content/blog/releases");
  const dirs = previewDirectory
    ? [previewDirectory]
    : (await readdir(releases, { withFileTypes: true }))
        .filter((x) => x.isDirectory() && !x.name.endsWith(".staging"))
        .map((x) => path.join(releases, x.name));
  const catalogue = [];
  const withdrawn = [];
  for (const dir of dirs) {
    const record = JSON.parse(
      await safeRead(dir, previewDirectory ? "request.json" : "release.json"),
    );
    if (!slugPattern.test(record.slug) || record.schema_version !== 1)
      throw Error("Invalid release");
    if (!previewDirectory) {
      verifyPublicApproval(record);
    }
    if (!previewDirectory) {
      let withdrawal;
      try {
        withdrawal = JSON.parse(
          await safeRead(
            path.join(repo, "content/blog/withdrawals"),
            record.slug + ".json",
          ),
        );
      } catch (e) {
        if (e.code !== "ENOENT") throw e;
      }
      if (withdrawal) {
        verifyPublicApproval(withdrawal);
        if (
          withdrawal.action !== "unpublish_web" ||
          withdrawal.release_digest !== releaseIdentity(record)
        )
          throw Error("Stale withdrawal");
        withdrawn.push({
          slug: record.slug,
          request_digest: releaseIdentity(withdrawal),
        });
        continue;
      }
    }
    if (!previewDirectory) {
      if (record.renderer_digest !== (await rendererDigest(repo)))
        throw Error(
          "Renderer changed since approval; obtain a new rendered-release approval",
        );
    }
    const approvedAt = record.approval?.approved_at;
    if (!previewDirectory && Date.parse(approvedAt) > Date.now())
      throw Error("Future approvals cannot release content");
    const source = await safeRead(dir, "source.md");
    if (sha(source) !== record.files["source.md"])
      throw Error("Released source changed");
    const front = source.toString().match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    if (!front) throw Error("Missing source metadata");
    const meta = parse(front[1], { maxAliasCount: 0 });
    if (
      meta.fixture === true ||
      meta.title !== record.title ||
      meta.description !== record.description
    )
      throw Error("Metadata changed");
    if (
      meta.publishedAt &&
      (!Number.isFinite(Date.parse(meta.publishedAt)) ||
        Date.parse(meta.publishedAt) > Date.now())
    )
      throw Error("Future or invalid source date cannot be published");
    let body = source
      .toString()
      .slice(front[0].length)
      .replace(/^# [^\n]+\r?\n/, "");
    const assetPrefix =
      (previewDirectory ? process.env.BLOG_PREVIEW_BASE || "/blog" : "/blog") +
      "/media/" +
      record.slug +
      "/";
    for (const a of record.assets) {
      const bytes = await safeRead(dir, a.path);
      if (sha(bytes) !== record.files[a.path])
        throw Error("Released asset changed");
      const filename = path.basename(a.path);
      if (!/^[a-zA-Z0-9_-]+\.(svg|png|webp|jpe?g)$/.test(filename))
        throw Error("Invalid asset name");
      await mkdir(path.join(generated, "public/media", record.slug), {
        recursive: true,
      });
      await writeFile(
        path.join(generated, "public/media", record.slug, filename),
        bytes,
      );
      body = body.replaceAll(
        "](" + a.path + ")",
        "](" + assetPrefix + filename + ")",
      );
    }
    // Markdown, never generated MDX: no executable imports or components.
    const withoutCode = body.replace(/```[^\n]*\n[\s\S]*?```/g, "");
    if (
      /<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^>]*|\/?)>/.test(withoutCode) ||
      /!\[[^\]]*\](?!\()/.test(withoutCode)
    )
      throw Error(
        "Use inline Markdown images, not raw HTML or reference images",
      );
    const allowedImages = new Set(
      record.assets.map((a) => assetPrefix + path.basename(a.path)),
    );
    for (const match of withoutCode.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
      if (!allowedImages.has(match[1]))
        throw Error("Unreviewed image reference");
    }
    const tags = Array.isArray(meta.tags) ? meta.tags : [];
    if (
      tags.length > 8 ||
      tags.some((t) => typeof t !== "string" || !slugPattern.test(t))
    )
      throw Error("Invalid article topics");
    const requestedCover =
      typeof meta.cover === "string" ? meta.cover : meta.hero?.src;
    const coverAsset = requestedCover
      ? record.assets.find((a) => a.path === requestedCover)
      : record.assets.find((a) => !a.path.includes("-mobile."));
    if (requestedCover && !coverAsset)
      throw Error("Cover must be a reviewed asset");
    const cover = coverAsset
      ? {
          url: assetPrefix + path.basename(coverAsset.path),
          alt: coverAsset.alt,
        }
      : undefined;
    const readingTime = Math.max(
      1,
      Math.ceil(body.trim().split(/\s+/).length / 200),
    );
    const publishedAt =
      record.first_published_at || approvedAt || new Date().toISOString();
    const data = {
      slug: record.slug,
      title: record.title,
      description: record.description,
      publishedAt,
      ...(record.first_published_at ? { updatedAt: approvedAt } : {}),
      draft: !!previewDirectory,
      publicationAuthorised: !previewDirectory,
      fixture: false,
      tags,
      readingTime,
      ...(cover ? { cover } : {}),
      authors: ["cjski"],
      noindex: !!previewDirectory,
    };
    await writeFile(
      path.join(generated, "content", record.slug + ".md"),
      "---\n" + stringify(data) + "---\n" + body,
    );
    catalogue.push({
      ...data,
      bundleDigest: record.bundle_digest,
      rendererDigest: record.renderer_digest,
      assets: record.assets.map((a) => ({
        ...a,
        sha256: record.files[a.path],
        url: assetPrefix + path.basename(a.path),
      })),
    });
  }
  await writeFile(
    path.join(generated, "catalogue.json"),
    JSON.stringify(catalogue, null, 2),
  );
  await writeFile(
    path.join(generated, "withdrawn.json"),
    JSON.stringify(withdrawn),
  );
  return catalogue;
}
