import type { NextApiRequest, NextApiResponse } from "next";
import { readFile } from "fs/promises";
import path from "path";
import { allowLocalReview } from "@/lib/local-review";
import { draftRoot, loadDraft } from "@/lib/draft-article";
export default async function Media(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("Cache-Control", "private, no-store");
  if (
    !allowLocalReview(req) ||
    !["availability-desktop.svg", "availability-mobile.svg"].includes(
      String(req.query.file),
    )
  )
    return void res.status(404).end();
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return void res.status(405).end();
  }
  await loadDraft();
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  );
  res.send(
    await readFile(path.join(draftRoot, "assets", String(req.query.file))),
  );
}
