// Mechanical schema projection only. Never changes a verdict/check or invents PASS.
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { safeRead, digestManifest, sha } from "./contracts.mjs";
const keys = [
  "reviewer_profile",
  "bundle_digest",
  "result",
  "checks",
  "summary",
];
export function reviewAttestation(
  review,
  role,
  digest,
  reportReference = "the retained original task report",
) {
  if (
    review.reviewer_profile !== role ||
    review.bundle_digest !== digest ||
    !["PASS", "FAIL", "BLOCKED"].includes(review.result) ||
    !review.checks ||
    Array.isArray(review.checks) ||
    typeof review.summary !== "string" ||
    !review.summary.trim() ||
    !Object.values(review.checks).length ||
    !Object.values(review.checks).every((v) => typeof v === "boolean") ||
    (review.result === "PASS" && !Object.values(review.checks).every(Boolean))
  )
    throw Error(
      "Cannot project an invalid/stale reviewer declaration: " + role,
    );
  const projected = Object.fromEntries(keys.map((k) => [k, review[k]]));
  const extra = Object.fromEntries(
    Object.entries(review).filter(([k]) => !keys.includes(k)),
  );
  if (Object.keys(extra).length) {
    projected.summary +=
      "\n\nOperator schema projection: verdict and every check unchanged. Full detailed findings remain in " +
      reportReference +
      ".";
  }
  if (projected.summary.length > 4000)
    throw Error(
      "Reviewer must provide a summary within the strict 4000-character limit",
    );
  return projected;
}
export async function normaliseReviews(folder) {
  const manifest = JSON.parse(await safeRead(folder, "manifest.json"));
  const digest = digestManifest(manifest);
  for (const role of ["cmo", "qa-auditor", "default"]) {
    const relative = manifest.reviews?.[role];
    const bytes = await safeRead(folder, relative);
    const review = JSON.parse(bytes);
    const projected = reviewAttestation(
      review,
      role,
      digest,
      "the source task bundle at " +
        relative +
        ".full.json (SHA256 " +
        sha(bytes) +
        ")",
    );
    if (Object.keys(review).some((k) => !keys.includes(k))) {
      const original = relative + ".full.json";
      try {
        await writeFile(path.join(folder, original), bytes, {
          mode: 0o600,
          flag: "wx",
        });
      } catch (e) {
        if (e.code !== "EEXIST") throw e;
        if (sha(await safeRead(folder, original)) !== sha(bytes))
          throw Error(
            "Original reviewer report already exists with different bytes",
          );
      }
      await writeFile(
        path.join(folder, relative),
        JSON.stringify(projected, null, 2) + "\n",
        { mode: 0o600 },
      );
    }
  }
  return {
    bundle_digest: digest,
    status: "review_schema_projected",
    verdicts_changed: false,
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  if (!process.argv[2]) throw Error("Reviewed bundle folder required");
  console.log(
    JSON.stringify(await normaliseReviews(path.resolve(process.argv[2]))),
  );
}
