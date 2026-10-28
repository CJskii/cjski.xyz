import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  releaseIdentity,
  verifyApproval,
  rendererDigest,
} from "./contracts.mjs";
import { withdraw } from "./withdraw.mjs";
import { promote } from "./import.mjs";
const [draft, decision, ...flags] = process.argv.slice(2);
if (!draft || !decision)
  throw Error("Usage: submit.mjs PRIVATE_DRAFT DECISION_JSON [--execute]");
const record = JSON.parse(
  await readFile(path.join(draft, "request.json"), "utf8"),
);
const approval = JSON.parse(await readFile(decision, "utf8"));
verifyApproval(record, approval);
if (record.renderer_digest !== (await rendererDigest(process.cwd())))
  throw Error("Renderer changed since review");
const withdrawing = record.action === "unpublish_web";
const changePath = withdrawing
  ? "content/blog/withdrawals/" + record.slug + ".json"
  : "content/blog/releases/" + record.slug;
const branch =
  "content/" + record.slug + "-" + releaseIdentity(record).slice(0, 12);
if (!flags.includes("--execute")) {
  console.log(
    JSON.stringify({
      dry_run: true,
      branch,
      changes: [changePath],
      next: "Commit/push the website integration first, then run with --execute in the publisher checkout.",
    }),
  );
  process.exit(0);
}
function run(bin, args, cwd = process.cwd()) {
  const r = spawnSync(bin, args, { cwd, encoding: "utf8" });
  if (r.status !== 0)
    throw Error(bin + " failed; inspect private operator logs");
  return r.stdout.trim();
}
if (run("git", ["status", "--porcelain"]).length)
  throw Error("Publisher checkout must be clean");
const temp = await mkdtemp(path.join(tmpdir(), "cold-boot-publish-")),
  work = path.join(temp, "repo");
try {
  const exists =
    spawnSync("git", [
      "show-ref",
      "--verify",
      "--quiet",
      "refs/heads/" + branch,
    ]).status === 0;
  run(
    "git",
    exists
      ? ["worktree", "add", work, branch]
      : ["worktree", "add", "-b", branch, work, "HEAD"],
  );
  await (withdrawing ? withdraw : promote)(
    path.resolve(draft),
    path.resolve(decision),
    work,
  );
  run(
    "git",
    [
      "add",
      "--",
      changePath,
      ...(record.withdrawal_digest
        ? ["content/blog/withdrawals/" + record.slug + ".json"]
        : []),
    ],
    work,
  );
  if (
    spawnSync("git", ["diff", "--cached", "--quiet"], { cwd: work }).status !==
    0
  )
    run(
      "git",
      [
        "commit",
        "-m",
        (withdrawing ? "content: unpublish " : "content: publish ") +
          record.slug,
      ],
      work,
    );
  const body = path.join(temp, "pr.md");
  await writeFile(
    body,
    `${withdrawing ? "Unpublish" : "Publish"} the Founder-approved article revision ${record.source_revision}.\n\nThe release includes source, reviewed images and exact-revision Telegram approval. CI rebuilds Astro, validates the release and tests the website before deployment.\n\nRequest digest: ${releaseIdentity(record)}\n`,
  );
  run("git", ["push", "-u", "origin", branch], work);
  const existing = JSON.parse(
    run(
      "gh",
      ["pr", "list", "--head", branch, "--state", "all", "--json", "url,state"],
      work,
    ),
  );
  const previous = existing.find(
    (p) => p.state === "OPEN" || p.state === "MERGED",
  );
  const url =
    previous?.url ||
    run(
      "gh",
      [
        "pr",
        "create",
        "--base",
        process.env.WEBSITE_BASE_BRANCH || "main",
        "--head",
        branch,
        "--title",
        (withdrawing ? "Unpublish: " : "Publish: ") + record.title,
        "--body-file",
        body,
      ],
      work,
    );
  if (process.env.WEBSITE_AUTO_MERGE === "1" && previous?.state !== "MERGED")
    run("gh", ["pr", "merge", url, "--auto", "--squash"], work);
  console.log(
    JSON.stringify({
      status: "pull_request_created",
      url,
      branch,
      published: false,
    }),
  );
} finally {
  try {
    run("git", ["worktree", "remove", "--force", work]);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}
