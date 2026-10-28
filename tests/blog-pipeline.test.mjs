import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  rm,
  symlink,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  sha,
  digestManifest,
  releaseIdentity,
} from "../scripts/blog/contracts.mjs";
import { importDraft, promote } from "../scripts/blog/import.mjs";
import { prepare } from "../scripts/blog/prepare.mjs";
async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "blog-contract-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const repo = path.join(root, "repo"),
    bundle = path.join(root, "bundle");
  for (const folder of [
    "blog",
    "scripts/blog",
    "content/blog/releases",
    "src/styles",
    "src/lib",
  ])
    await mkdir(path.join(repo, folder), { recursive: true });
  for (const f of [
    "package.json",
    "package-lock.json",
    "src/styles/globals.css",
    "src/lib/site.ts",
  ])
    await writeFile(path.join(repo, f), "{}");
  await mkdir(path.join(bundle, "assets"), { recursive: true });
  await mkdir(path.join(bundle, "reviews"));
  const files = {
    "source.md":
      "---\ntitle: Useful sample\ndescription: A synthetic test, never a real publication.\ndraft: true\n---\n# Useful sample\n\n## Mechanism\nText.\n\n![A box](assets/figure.svg)\n",
    "assets/figure.svg":
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="80"><rect width="10" height="10"/></svg>',
    "article.html": "<h1>Useful sample</h1>",
    "evidence.md": "Synthetic evidence.",
  };
  for (const [f, b] of Object.entries(files))
    await writeFile(path.join(bundle, f), b);
  const m = {
    schema_version: 1,
    content_id: "sample",
    revision: "v1",
    title: "Useful sample",
    content_kind: "long_form",
    channel: "web",
    requested_action: "review_only",
    canonical_url: "https://cjski.dev/blog/useful-sample/",
    preview_url: "https://preview.cjskii.duckdns.org/sample.html",
    artifacts: Object.entries(files).map(([p, b]) => ({
      path: p,
      sha256: sha(b),
      kind:
        p === "source.md"
          ? "source"
          : p.endsWith(".svg")
            ? "visual"
            : p.endsWith(".html")
              ? "rendered"
              : "evidence",
      alt: p.endsWith(".svg") ? "A box" : "",
      caption: p.endsWith(".svg") ? "Synthetic fixture" : "",
    })),
    reviews: {},
  };
  const checks = {
    cmo: ["audience_fit", "seo_metadata", "useful_visuals", "channel_scope"],
    "qa-auditor": ["evidence", "privacy", "assets", "rendering"],
    default: ["independent_reviews", "revision_match", "requested_action"],
  };
  for (const [role, keys] of Object.entries(checks)) {
    m.reviews[role] = "reviews/" + role + ".json";
    await writeFile(
      path.join(bundle, m.reviews[role]),
      JSON.stringify({
        reviewer_profile: role,
        bundle_digest: digestManifest(m),
        result: "PASS",
        checks: Object.fromEntries(keys.map((k) => [k, true])),
        summary: "Synthetic independent review.",
      }),
    );
  }
  await writeFile(path.join(bundle, "manifest.json"), JSON.stringify(m));
  return { root, repo, bundle, m };
}
function approval(record) {
  return {
    action: "publish_web",
    request_digest: releaseIdentity(record),
    approved_by: "founder_telegram:123",
    message_id: 42,
    approved_at: "2026-10-25T10:00:00Z",
  };
}
test("review-only import stays private; only explicit matching publication approval reaches catalogue/assets", async (t) => {
  const { root, repo, bundle } = await fixture(t),
    draft = await importDraft(bundle, repo);
  assert.deepEqual(await prepare(repo), []);
  const decision = path.join(root, "decision.json");
  await writeFile(
    decision,
    JSON.stringify({ ...approval(draft.record), action: "review_only" }),
  );
  await assert.rejects(
    promote(draft.directory, decision, repo),
    /website approval/,
  );
  await writeFile(decision, JSON.stringify(approval(draft.record)));
  await promote(draft.directory, decision, repo);
  const publicRecord = await readFile(
    path.join(repo, "content/blog/releases/useful-sample/release.json"),
    "utf8",
  );
  assert.doesNotMatch(publicRecord, /founder_telegram|message_id|approved_by/);
  const rows = await prepare(repo);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].draft, false);
  assert.equal(rows[0].publicationAuthorised, true);
  assert.match(
    await readFile(
      path.join(repo, ".generated/blog/content/useful-sample.md"),
      "utf8",
    ),
    /\/blog\/media\/useful-sample\/figure.svg/,
  );
  assert.equal(
    await promote(draft.directory, decision, repo),
    path.join(repo, "content/blog/releases/useful-sample"),
  );
});
test("source tampering, stale reviews and symlink artifacts fail import", async (t) => {
  const { bundle, m } = await fixture(t);
  await writeFile(path.join(bundle, "source.md"), "changed");
  await assert.rejects(importDraft(bundle), /hash mismatch/);
  await rm(path.join(bundle, "source.md"));
  await symlink("/etc/hostname", path.join(bundle, "source.md"));
  await assert.rejects(importDraft(bundle), /Symlink/);
});
test("approval binds renderer and released asset bytes", async (t) => {
  const { root, repo, bundle } = await fixture(t),
    draft = await importDraft(bundle, repo),
    decision = path.join(root, "decision.json");
  await writeFile(decision, JSON.stringify(approval(draft.record)));
  await writeFile(path.join(repo, "blog/change.txt"), "new rendering");
  await assert.rejects(
    promote(draft.directory, decision, repo),
    /Renderer changed/,
  );
  await rm(path.join(repo, "blog/change.txt"));
  await promote(draft.directory, decision, repo);
  await writeFile(
    path.join(repo, "content/blog/releases/useful-sample/assets/figure.svg"),
    "changed",
  );
  await assert.rejects(prepare(repo), /asset changed/);
});
test("failed independent review and fixture metadata cannot be imported", async (t) => {
  const { bundle, repo } = await fixture(t);
  const file = path.join(bundle, "reviews/qa-auditor.json");
  const review = JSON.parse(await readFile(file));
  review.checks.privacy = false;
  await writeFile(file, JSON.stringify(review));
  await assert.rejects(importDraft(bundle, repo), /qa-auditor/);
});

test("unpublish requires its own decision and excludes article/media from rebuilt discovery", async (t) => {
  const { root, repo, bundle } = await fixture(t),
    draft = await importDraft(bundle, repo),
    decision = path.join(root, "approve.json");
  await writeFile(decision, JSON.stringify(approval(draft.record)));
  await promote(draft.directory, decision, repo);
  assert.equal((await prepare(repo)).length, 1);
  const { requestWithdrawal, withdraw } =
    await import("../scripts/blog/withdraw.mjs");
  const request = await requestWithdrawal("useful-sample", repo);
  await assert.rejects(
    withdraw(request.directory, decision, repo),
    /approval required/,
  );
  const withdrawal = path.join(root, "withdraw.json");
  await writeFile(
    withdrawal,
    JSON.stringify({ ...approval(request.record), action: "unpublish_web" }),
  );
  await withdraw(request.directory, withdrawal, repo);
  assert.deepEqual(await prepare(repo), []);
  const marker = JSON.parse(
    await readFile(path.join(repo, ".generated/blog/withdrawn.json"), "utf8"),
  );
  assert.equal(marker[0].slug, "useful-sample");
  await assert.rejects(
    readFile(
      path.join(repo, ".generated/blog/public/media/useful-sample/figure.svg"),
    ),
    /ENOENT/,
  );
});

test("republishing a withdrawn article needs a fresh approval bound to its release state", async (t) => {
  const { root, repo, bundle } = await fixture(t),
    draft = await importDraft(bundle, repo),
    decision = path.join(root, "initial.json");
  await writeFile(decision, JSON.stringify(approval(draft.record)));
  await promote(draft.directory, decision, repo);
  const { requestWithdrawal, withdraw } =
    await import("../scripts/blog/withdraw.mjs");
  const removal = await requestWithdrawal("useful-sample", repo);
  const removalApproval = path.join(root, "remove.json");
  await writeFile(
    removalApproval,
    JSON.stringify({ ...approval(removal.record), action: "unpublish_web" }),
  );
  await withdraw(removal.directory, removalApproval, repo);
  const replacement = await importDraft(bundle, repo);
  assert.ok(replacement.record.withdrawal_digest);
  await assert.rejects(
    promote(replacement.directory, decision, repo),
    /approval required/,
  );
  const fresh = path.join(root, "fresh.json");
  await writeFile(fresh, JSON.stringify(approval(replacement.record)));
  await promote(replacement.directory, fresh, repo);
  assert.equal((await prepare(repo)).length, 1);
  await assert.rejects(
    readFile(path.join(repo, "content/blog/withdrawals/useful-sample.json")),
    /ENOENT/,
  );
});

test("every article requires exact-revision SEO, independent QA and CEO checks", async (t) => {
  for (const [role, check] of [
    ["cmo", "seo_metadata"],
    ["qa-auditor", "rendering"],
    ["qa-auditor", "evidence"],
    ["default", "independent_reviews"],
  ]) {
    const { bundle, repo, m } = await fixture(t);
    const file = path.join(bundle, m.reviews[role]);
    const review = JSON.parse(await readFile(file, "utf8"));
    review.checks[check] = false;
    await writeFile(file, JSON.stringify(review));
    await assert.rejects(importDraft(bundle, repo), /review/);
  }
  for (const role of ["cmo", "qa-auditor", "default"]) {
    const { bundle, repo, m } = await fixture(t);
    delete m.reviews[role];
    await writeFile(path.join(bundle, "manifest.json"), JSON.stringify(m));
    await assert.rejects(importDraft(bundle, repo));
  }
});

test("a blog without a reviewed illustration cannot enter the website pipeline", async (t) => {
  const { bundle, repo, m } = await fixture(t);
  m.artifacts = m.artifacts.filter((a) => a.kind !== "visual");
  for (const file of Object.values(m.reviews)) {
    const review = JSON.parse(await readFile(path.join(bundle, file), "utf8"));
    review.bundle_digest = digestManifest(m);
    await writeFile(path.join(bundle, file), JSON.stringify(review));
  }
  await writeFile(path.join(bundle, "manifest.json"), JSON.stringify(m));
  await assert.rejects(importDraft(bundle, repo), /visual/);
});

test("evidence and rendered output are mandatory blog artifacts", async (t) => {
  for (const kind of ["rendered", "evidence"]) {
    const { bundle, repo, m } = await fixture(t);
    m.artifacts = m.artifacts.filter((a) => a.kind !== kind);
    for (const file of Object.values(m.reviews)) {
      const review = JSON.parse(
        await readFile(path.join(bundle, file), "utf8"),
      );
      review.bundle_digest = digestManifest(m);
      await writeFile(path.join(bundle, file), JSON.stringify(review));
    }
    await writeFile(path.join(bundle, "manifest.json"), JSON.stringify(m));
    await assert.rejects(
      importDraft(bundle, repo),
      /rendered output and evidence/,
    );
  }
});

test("a packaged image is insufficient when no reviewed figure appears in the article", async (t) => {
  const { bundle, repo, m } = await fixture(t);
  const sourceFile = path.join(bundle, "source.md");
  const source = (await readFile(sourceFile, "utf8")).replace(
    "![A box](assets/figure.svg)",
    "",
  );
  await writeFile(sourceFile, source);
  m.artifacts.find((a) => a.path === "source.md").sha256 = sha(source);
  for (const file of Object.values(m.reviews)) {
    const review = JSON.parse(await readFile(path.join(bundle, file), "utf8"));
    review.bundle_digest = digestManifest(m);
    await writeFile(path.join(bundle, file), JSON.stringify(review));
  }
  await writeFile(path.join(bundle, "manifest.json"), JSON.stringify(m));
  await assert.rejects(importDraft(bundle, repo), /Article body must include/);
});

test("unreviewed renderer candidates cannot request publication or be promoted", async (t) => {
  const { root, repo, bundle } = await fixture(t);
  await writeFile(
    path.join(bundle, "request.json"),
    JSON.stringify({ action: "review_candidate", review_status: "unreviewed" }),
  );
  const result = spawnSync(
    process.execPath,
    [
      path.resolve("scripts/blog/request.mjs"),
      bundle,
      "https://preview.cjskii.duckdns.org/test",
      path.join(root, "registry"),
    ],
    { encoding: "utf8" },
  );
  assert.notEqual(result.status, 0);
  assert.match(
    result.stderr,
    /Unreviewed candidate cannot request publication/,
  );
  await assert.rejects(
    promote(bundle, path.join(root, "not-an-approval.json"), repo),
    /dedicated withdrawal workflow/,
  );
});
