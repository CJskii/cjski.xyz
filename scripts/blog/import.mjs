import { mkdir, writeFile, rename, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  verifyBundle,
  releaseIdentity,
  verifyApproval,
  rendererDigest,
  publicApproval,
  verifyPublicApproval,
  safeRead,
  sha,
} from "./contracts.mjs";
export async function importDraft(bundle, repo = process.cwd()) {
  const v = await verifyBundle(bundle);
  let previous, withdrawal;
  try {
    previous = JSON.parse(
      await safeRead(
        path.join(repo, "content/blog/releases", v.slug),
        "release.json",
      ),
    );
    verifyPublicApproval(previous);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  if (previous) {
    try {
      withdrawal = JSON.parse(
        await safeRead(
          path.join(repo, "content/blog/withdrawals"),
          v.slug + ".json",
        ),
      );
      verifyPublicApproval(withdrawal);
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
  }
  const record = {
    schema_version: 1,
    ...(previous
      ? {
          replaces_digest: releaseIdentity(previous),
          first_published_at:
            previous.first_published_at || previous.approval.approved_at,
        }
      : {}),
    ...(withdrawal ? { withdrawal_digest: releaseIdentity(withdrawal) } : {}),
    renderer_digest: await rendererDigest(repo),
    slug: v.slug,
    title: v.meta.title,
    description: v.meta.description,
    canonical_url: v.manifest.canonical_url,
    bundle_digest: v.digest,
    source_revision: v.manifest.revision,
    manifest_sha256: v.manifestHash,
    files: Object.fromEntries([...v.files].map(([p, b]) => [p, sha(b)])),
    assets: v.assets.map(({ path, alt, caption }) => ({ path, alt, caption })),
  };
  const id = releaseIdentity(record),
    target = path.join(repo, "content/private/blog", id);
  await mkdir(target, { recursive: true, mode: 0o700 });
  for (const [relative, bytes] of v.files) {
    const out = path.join(target, relative);
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, bytes, { mode: 0o600 });
  }
  await writeFile(
    path.join(target, "request.json"),
    JSON.stringify(record, null, 2) + "\n",
    { mode: 0o600 },
  );
  return { id, directory: target, record };
}
export async function promote(draft, approvalFile, repo = process.cwd()) {
  const record = JSON.parse(
    await readFile(path.join(draft, "request.json"), "utf8"),
  );
  if (record.action) throw Error("Use the dedicated withdrawal workflow");
  const approval = JSON.parse(await readFile(approvalFile, "utf8"));
  verifyApproval(record, approval);
  if (record.renderer_digest !== (await rendererDigest(repo)))
    throw Error("Renderer changed; rebuild preview and obtain a new approval");
  const target = path.join(repo, "content/blog/releases", record.slug),
    staging = target + ".staging";
  await rm(staging, { recursive: true, force: true });
  await mkdir(staging, { recursive: true });
  try {
    for (const relative of ["source.md", ...record.assets.map((a) => a.path)]) {
      const { safeRead } = await import("./contracts.mjs");
      const bytes = await safeRead(draft, relative);
      if (sha(bytes) !== record.files[relative])
        throw Error("Draft changed after review");
      const out = path.join(staging, relative);
      await mkdir(path.dirname(out), { recursive: true });
      await writeFile(out, bytes);
    }
    await writeFile(
      path.join(staging, "release.json"),
      JSON.stringify(
        { ...record, approval: publicApproval(record, approval) },
        null,
        2,
      ) + "\n",
    );
    let old;
    try {
      old = JSON.parse(
        await readFile(path.join(target, "release.json"), "utf8"),
      );
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
    if (old) {
      if (releaseIdentity(old) === releaseIdentity(record)) {
        await rm(staging, { recursive: true });
        return target;
      }
      if (record.replaces_digest !== releaseIdentity(old))
        throw Error(
          "Published revision changed; obtain a fresh replacement approval",
        );
      for (const relative of ["source.md", ...old.assets.map((a) => a.path)])
        if (sha(await safeRead(target, relative)) !== old.files[relative])
          throw Error("Existing release locally modified; refusing overwrite");
      let withdrawal;
      const withdrawalPath = path.join(
        repo,
        "content/blog/withdrawals",
        record.slug + ".json",
      );
      try {
        withdrawal = JSON.parse(await readFile(withdrawalPath, "utf8"));
      } catch (e) {
        if (e.code !== "ENOENT") throw e;
      }
      if (
        (withdrawal ? releaseIdentity(withdrawal) : undefined) !==
        record.withdrawal_digest
      )
        throw Error("Publication state changed; obtain a fresh approval");
      const backup = target + ".previous";
      await rename(target, backup);
      try {
        await rename(staging, target);
      } catch (e) {
        await rename(backup, target);
        throw e;
      }
      await rm(backup, { recursive: true });
      if (withdrawal) await rm(withdrawalPath);
      return target;
    }
    if (record.replaces_digest)
      throw Error("Expected previous revision is missing");
    await rename(staging, target);
    return target;
  } catch (e) {
    await rm(staging, { recursive: true, force: true });
    throw e;
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const [action, a, b] = process.argv.slice(2);
  if (action === "import" && a)
    console.log(JSON.stringify(await importDraft(a)));
  else if (action === "promote" && a && b) console.log(await promote(a, b));
  else
    throw Error(
      "Usage: import.mjs import BUNDLE | promote PRIVATE_DRAFT APPROVAL_JSON",
    );
}
