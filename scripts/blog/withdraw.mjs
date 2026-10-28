import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  slugPattern,
  safeRead,
  verifyPublicApproval,
  releaseIdentity,
  publicApproval,
  rendererDigest,
} from "./contracts.mjs";
export async function requestWithdrawal(slug, repo = process.cwd()) {
  if (!slugPattern.test(slug)) throw Error("Invalid article slug");
  const release = JSON.parse(
    await safeRead(
      path.join(repo, "content/blog/releases", slug),
      "release.json",
    ),
  );
  verifyPublicApproval(release);
  const record = {
    schema_version: 1,
    action: "unpublish_web",
    slug,
    title: release.title,
    source_revision: release.source_revision,
    canonical_url: release.canonical_url,
    release_digest: releaseIdentity(release),
    renderer_digest: await rendererDigest(repo),
  };
  const directory = path.join(
    repo,
    "content/private/blog-withdrawals",
    releaseIdentity(record),
  );
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await writeFile(
    path.join(directory, "request.json"),
    JSON.stringify(record, null, 2),
    { mode: 0o600 },
  );
  return { record, directory };
}
export async function withdraw(directory, approvalFile, repo = process.cwd()) {
  const record = JSON.parse(await safeRead(directory, "request.json"));
  if (record.action !== "unpublish_web" || !slugPattern.test(record.slug))
    throw Error("Expected explicit unpublish request");
  const approval = JSON.parse(await readFile(approvalFile, "utf8"));
  const safe = publicApproval(record, approval);
  const current = JSON.parse(
    await safeRead(
      path.join(repo, "content/blog/releases", record.slug),
      "release.json",
    ),
  );
  if (record.release_digest !== releaseIdentity(current))
    throw Error("Article revision changed; request a fresh withdrawal");
  const output = path.join(repo, "content/blog/withdrawals");
  await mkdir(output, { recursive: true });
  await writeFile(
    path.join(output, record.slug + ".json"),
    JSON.stringify({ ...record, approval: safe }, null, 2) + "\n",
  );
  return path.join(output, record.slug + ".json");
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const [action, a, b] = process.argv.slice(2);
  if (action === "request" && a)
    console.log(JSON.stringify(await requestWithdrawal(a)));
  else if (action === "apply" && a && b) console.log(await withdraw(a, b));
  else
    throw Error(
      "Usage: withdraw.mjs request SLUG | apply PRIVATE_REQUEST APPROVAL_FILE",
    );
}
