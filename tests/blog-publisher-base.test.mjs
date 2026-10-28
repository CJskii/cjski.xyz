import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const worker = fileURLToPath(
  new URL("../scripts/blog/worker.mjs", import.meta.url),
);
function git(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout.trim();
}
async function setup(t) {
  const root = await mkdtemp(path.join(tmpdir(), "publisher-base-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const remote = path.join(root, "origin.git"),
    seed = path.join(root, "seed"),
    publisher = path.join(root, "publisher"),
    registry = path.join(root, "registry");
  git(root, "init", "--bare", "--initial-branch=main", remote);
  git(root, "clone", remote, seed);
  git(seed, "config", "user.email", "test@example.invalid");
  git(seed, "config", "user.name", "Synthetic test");
  await mkdir(path.join(seed, "scripts/blog"), { recursive: true });
  await writeFile(
    path.join(seed, "scripts/blog/submit.mjs"),
    "import {spawnSync} from 'node:child_process';console.log(JSON.stringify({head:spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim()}));\n",
  );
  await writeFile(path.join(seed, "base.txt"), "first");
  git(seed, "add", ".");
  git(seed, "commit", "-m", "Synthetic publisher base");
  git(seed, "push", "origin", "main");
  git(root, "clone", remote, publisher);
  await mkdir(registry);
  const id = "a".repeat(32);
  await writeFile(
    path.join(registry, id + ".decision.json"),
    JSON.stringify({ action: "publish_web" }),
  );
  await writeFile(
    path.join(registry, id + ".json"),
    JSON.stringify({ draft_directory: path.join(root, "draft") }),
  );
  const run = () =>
    spawnSync(process.execPath, [worker], {
      cwd: publisher,
      encoding: "utf8",
      env: {
        ...process.env,
        WEBSITE_PUBLICATION_REGISTRY: registry,
        WEBSITE_PUBLISHER_ENABLED: "1",
        WEBSITE_BASE_BRANCH: "main",
      },
    });
  return { seed, publisher, registry, id, run };
}
test("an approved job fast-forwards the clean publisher to the current remote base before submission", async (t) => {
  const f = await setup(t);
  await writeFile(path.join(f.seed, "base.txt"), "second");
  git(f.seed, "add", ".");
  git(f.seed, "commit", "-m", "New base");
  git(f.seed, "push", "origin", "main");
  const expected = git(f.seed, "rev-parse", "HEAD");
  const r = f.run();
  assert.equal(r.status, 0, r.stderr);
  assert.equal(git(f.publisher, "rev-parse", "HEAD"), expected);
  assert.equal(
    JSON.parse(
      await readFile(path.join(f.registry, f.id + ".submitted.json"), "utf8"),
    ).head,
    expected,
  );
});
test("a dirty publisher blocks an approved job without creating a submission receipt", async (t) => {
  const f = await setup(t);
  await writeFile(path.join(f.publisher, "base.txt"), "local change");
  const r = f.run();
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /must be clean/);
  await assert.rejects(
    readFile(path.join(f.registry, f.id + ".submitted.json")),
    { code: "ENOENT" },
  );
});
