import { NextApiRequest, NextApiResponse } from "next";

let pinnedReposCache: {
  data: any;
  expiry: number;
} | null = null;

const CACHE_DURATION = 720 * 1000; // 12 minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

  if (pinnedReposCache && Date.now() < pinnedReposCache.expiry) {
    console.log("Serving pinned repositories from cache");
    return res.status(200).json(pinnedReposCache.data);
  }

  if (!GITHUB_ACCESS_TOKEN) {
    return res
      .status(500)
      .json({ error: "GitHub access token is not defined" });
  }

  const query = `
    query {
      user(login: "CJskii") {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              description
              url
              updatedAt
              stargazerCount
              forkCount
              licenseInfo {
                name
              }
              primaryLanguage {
                name
                color
              }
              defaultBranchRef {
                target {
                  ... on Commit {
                    committedDate
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch pinned repositories");
    }

    const data = await response.json();

    const pinnedRepos = data.data.user.pinnedItems.nodes.map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      url: repo.url,
      updatedAt: repo.updatedAt,
      lastCommitDate: repo.defaultBranchRef.target.committedDate,
      stargazerCount: repo.stargazerCount,
      forkCount: repo.forkCount,
      license: repo.licenseInfo ? repo.licenseInfo.name : "No license",
      primaryLanguage: repo.primaryLanguage
        ? repo.primaryLanguage.name
        : "Unknown",
      primaryLanguageColor: repo.primaryLanguage
        ? repo.primaryLanguage.color
        : "#000000",
    }));

    pinnedReposCache = {
      data: { pinnedRepos },
      expiry: Date.now() + CACHE_DURATION,
    };

    return res.status(200).json({ pinnedRepos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
