import { readFile } from "fs/promises";
import { createHash } from "crypto";
import path from "path";
export const draftSlug = "local-model-worker-cloud-fallback";
export const draftRoot = path.join(process.cwd(), "content/private", draftSlug);
export async function loadDraft() {
  const contract = JSON.parse(
    await readFile(path.join(draftRoot, "IMPORT_CONTRACT.json"), "utf8"),
  );
  if (contract.draft !== true || contract.publication_authorised !== false)
    throw new Error("Draft import contract changed");
  for (const [file, expected] of Object.entries(contract.files)) {
    if (
      !/^(source\.md|article\.html|assets\/availability-(desktop|mobile)\.svg)$/.test(
        file,
      )
    )
      throw new Error("Unexpected artifact");
    const data = await readFile(path.join(draftRoot, file));
    if (createHash("sha256").update(data).digest("hex") !== expected)
      throw new Error("Draft artifact changed; re-import and re-review");
  }
  const html = await readFile(path.join(draftRoot, "article.html"), "utf8");
  const match = html.match(/<h1>([\s\S]*?)<\/h1>([\s\S]*?)<\/main>/);
  if (!match || /<script|on\w+\s*=/i.test(match[2]))
    throw new Error("Unexpected reviewed HTML body");
  let body = match[2].replaceAll(
    "assets/availability-",
    "/api/review/media?file=availability-",
  );
  let index = 0;
  const headings: { id: string; title: string }[] = [];
  body = body.replace(/<h2>(.*?)<\/h2>/g, (_, title: string) => {
    const id = `section-${++index}`;
    headings.push({ id, title });
    return `<h2 id="${id}">${title}</h2>`;
  });
  return {
    title: match[1],
    body,
    headings,
    revision: "v3",
    sourceHash: contract.files["source.md"],
    bundleDigest: contract.upstream_bundle_digest,
    canonical: contract.intended_canonical,
  };
}
