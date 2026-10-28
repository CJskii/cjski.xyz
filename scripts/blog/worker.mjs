import { readdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
const root = process.env.WEBSITE_PUBLICATION_REGISTRY;
if (!root) throw Error("Configure private WEBSITE_PUBLICATION_REGISTRY");
let synced = false;
for (const file of await readdir(root)) {
  if (!/^[a-f0-9]{32}\.decision\.json$/.test(file)) continue;
  const id = file.slice(0, 32),
    decision = JSON.parse(await readFile(path.join(root, file), "utf8"));
  if (!["publish_web", "unpublish_web"].includes(decision.action)) continue;
  const request = JSON.parse(
    await readFile(path.join(root, id + ".json"), "utf8"),
  );
  const receiptFile = path.join(root, id + ".submitted.json");
  try {
    await readFile(receiptFile);
    continue;
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  if (!request.draft_directory)
    throw Error("Missing publisher draft directory");
  // The submit command remains dry-run unless the operator explicitly enables execution.
  const execute = process.env.WEBSITE_PUBLISHER_ENABLED === "1";
  if (execute && !synced) {
    const git = (args) => {
      const r = spawnSync("git", args, { encoding: "utf8" });
      if (r.status !== 0)
        throw Error("Publisher base sync failed; no submission attempted");
      return r.stdout.trim();
    };
    if (git(["status", "--porcelain"]))
      throw Error("Publisher checkout must be clean");
    const base = process.env.WEBSITE_BASE_BRANCH || "main";
    if (!/^[a-zA-Z0-9][a-zA-Z0-9/_.-]*$/.test(base))
      throw Error("Invalid publisher base branch");
    git(["fetch", "origin", base]);
    git(["merge", "--ff-only", "FETCH_HEAD"]);
    synced = true;
  }
  const result = spawnSync(
    process.execPath,
    [
      "scripts/blog/submit.mjs",
      request.draft_directory,
      path.join(root, file),
      ...(execute ? ["--execute"] : []),
    ],
    { encoding: "utf8", cwd: process.cwd() },
  );
  if (result.status !== 0) {
    console.error(
      JSON.stringify({ request_id: id, status: "submission_blocked" }),
    );
    continue;
  }
  console.log(result.stdout.trim());
  if (execute)
    await writeFile(receiptFile, result.stdout, { mode: 0o600, flag: "wx" });
}
