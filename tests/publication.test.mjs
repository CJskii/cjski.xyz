import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { publicArticles, escapeXml } from "../scripts/content-policy.mjs";
import { allowLocalReview } from "../src/lib/local-review.ts";
import { loadDraft, draftRoot } from "../src/lib/draft-article.ts";

test("public selection excludes drafts, fixtures, future posts, missing dates and unapproved content", () => {
  const base = {
    slug: "approved",
    draft: false,
    publicationAuthorised: true,
    publishedAt: "2026-10-25T12:00:00Z",
  };
  const input = [
    base,
    { ...base, slug: "draft", draft: true },
    { ...base, slug: "fixture", fixture: true },
    { ...base, slug: "future", publishedAt: "2099-01-01" },
    { ...base, slug: "unapproved", publicationAuthorised: false },
    { ...base, slug: "no-date", publishedAt: undefined },
    { ...base, slug: "invalid-date", publishedAt: "not-a-date" },
  ];
  assert.deepEqual(
    publicArticles(input, new Date("2026-10-26")).map((p) => p.slug),
    ["approved"],
  );
});

test("local draft protection requires explicit flag, loopback socket, matching host and no proxy headers", () => {
  const previous = process.env.WEBSITE_LOCAL_REVIEW;
  const req = {
    socket: { remoteAddress: "127.0.0.1" },
    headers: { host: "127.0.0.1:3100" },
  };
  try {
    delete process.env.WEBSITE_LOCAL_REVIEW;
    assert.equal(allowLocalReview(req), false);
    process.env.WEBSITE_LOCAL_REVIEW = "1";
    assert.equal(allowLocalReview(req), true);
    assert.equal(
      allowLocalReview({ ...req, socket: { remoteAddress: "192.0.2.1" } }),
      false,
    );
    assert.equal(
      allowLocalReview({ ...req, headers: { host: "public.example" } }),
      false,
    );
    for (const name of ["x-forwarded-for", "forwarded", "x-forwarded-host"])
      assert.equal(
        allowLocalReview({
          ...req,
          headers: { ...req.headers, [name]: "127.0.0.1" },
        }),
        false,
      );
  } finally {
    if (previous === undefined) delete process.env.WEBSITE_LOCAL_REVIEW;
    else process.env.WEBSITE_LOCAL_REVIEW = previous;
  }
});

test("imported content matches exact contract and remains a draft", async (context) => {
  try {
    await access(`${draftRoot}/IMPORT_CONTRACT.json`);
  } catch {
    context.skip(
      "Import the private reviewed package to run this rehearsal check.",
    );
    return;
  }
  const contract = JSON.parse(
    await readFile(`${draftRoot}/IMPORT_CONTRACT.json`, "utf8"),
  );
  assert.equal(contract.draft, true);
  assert.equal(contract.publication_authorised, false);
  for (const [file, sha] of Object.entries(contract.files))
    assert.equal(
      createHash("sha256")
        .update(await readFile(`${draftRoot}/${file}`))
        .digest("hex"),
      sha,
      file,
    );
  const draft = await loadDraft();
  assert.equal(draft.revision, "v3");
  assert.equal(draft.headings.length, 5);
  assert.match(
    draft.body,
    /srcset="\/api\/review\/media\?file=availability-mobile.svg"/,
  );
  assert.match(draft.body, /3\.124–4\.319/);
  assert.doesNotMatch(draft.body, /<script/);
  assert.deepEqual(publicArticles([contract]), []);
});

test("discovery XML escapes reserved characters", () => {
  assert.equal(
    escapeXml('A&B <test> "ok"'),
    "A&amp;B &lt;test&gt; &quot;ok&quot;",
  );
});
