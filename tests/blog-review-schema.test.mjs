import test from "node:test";
import assert from "node:assert/strict";
import { reviewAttestation } from "../scripts/blog/normalise-reviews.mjs";
const digest = "a".repeat(64);
const base = {
  reviewer_profile: "cmo",
  bundle_digest: digest,
  result: "PASS",
  checks: { seo_metadata: true },
  summary: "Private review only.",
};
test("review projection preserves verdict/checks and retains detailed limitations", () => {
  const input = {
    ...base,
    scope: { public_release_ready: false },
    limitations: ["Public deployment pending"],
  };
  const result = reviewAttestation(input, "cmo", digest);
  assert.deepEqual(Object.keys(result).sort(), Object.keys(base).sort());
  assert.equal(result.result, input.result);
  assert.deepEqual(result.checks, input.checks);
  assert.match(result.summary, /retained original task report/);
  assert.deepEqual(input.limitations, ["Public deployment pending"]);
  assert.ok(result.summary.length <= 4000);
  assert.equal(input.scope.public_release_ready, false);
});
test("review projection cannot convert a rejection or failed check into PASS", () => {
  const fail = {
    ...base,
    result: "BLOCKED",
    checks: { seo_metadata: false },
    detail: "Missing source",
  };
  const result = reviewAttestation(fail, "cmo", digest);
  assert.equal(result.result, "BLOCKED");
  assert.equal(result.checks.seo_metadata, false);
  assert.throws(() =>
    reviewAttestation({ ...fail, result: "PASS" }, "cmo", digest),
  );
  assert.throws(() => reviewAttestation(base, "qa-auditor", digest));
  assert.throws(() => reviewAttestation(base, "cmo", "b".repeat(64)));
});
