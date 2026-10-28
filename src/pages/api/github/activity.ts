import type { NextApiRequest, NextApiResponse } from "next";
import { getGithubSnapshot } from "@/lib/github-service";
export default async function Activity(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Use GET." });
    return;
  }
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=900, stale-while-revalidate=3600",
  );
  res.status(200).json(await getGithubSnapshot());
}
