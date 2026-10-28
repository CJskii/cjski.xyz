import type { NextApiRequest, NextApiResponse } from "next";
import { selectedProjects } from "@/lib/projects";
import { getGithubSnapshot } from "@/lib/github-service";
export default async function FeaturedRepos(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Use GET." });
    return;
  }
  const snapshot = await getGithubSnapshot();
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=900, stale-while-revalidate=3600",
  );
  // Keep the old response field for compatibility; this selection is curated, not GitHub pins.
  const pinnedRepos = selectedProjects
    .map((project) =>
      snapshot.repos.find((repo) => repo.url === project.githubLink),
    )
    .filter(Boolean);
  res
    .status(200)
    .json({ pinnedRepos, selection: "curated", checkedAt: snapshot.checkedAt });
}
