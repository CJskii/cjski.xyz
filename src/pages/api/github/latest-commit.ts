import { NextApiRequest, NextApiResponse } from "next";

let commitCache: {
  [key: string]: { data: any; expiry: number };
} = {};

const CACHE_DURATION = 720 * 1000; // 12 minutes
const GITHUB_API_URL = "https://api.github.com/graphql";
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cacheKey = "latestCommit";
  const username = "CJskii";

  if (commitCache[cacheKey] && Date.now() < commitCache[cacheKey].expiry) {
    console.log("Serving commit data from cache");
    return res.status(200).json(commitCache[cacheKey].data);
  }

  if (!GITHUB_ACCESS_TOKEN) {
    return res.status(500).json({ error: "GitHub Access Token is not set" });
  }

  const query = `
    query ($username: String!) {
      user(login: $username) {
        repositories(first: 10, orderBy: { field: UPDATED_AT, direction: DESC }) {
          nodes {
            name
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 1) {
                    edges {
                      node {
                        message
                        committedDate
                        url
                      }
                    }
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
    const response = await fetch(GITHUB_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch the latest commit");
    }

    const data = await response.json();

    const repositories = data.data.user.repositories.nodes;
    const latestRepo = repositories.find((repo: any) => repo.defaultBranchRef);
    if (
      latestRepo &&
      latestRepo.defaultBranchRef.target.history.edges.length > 0
    ) {
      const latestCommit =
        latestRepo.defaultBranchRef.target.history.edges[0].node;
      const commitData = {
        message: latestCommit.message,
        date: latestCommit.committedDate,
        repo: latestRepo.name,
        url: latestCommit.url,
      };

      commitCache[cacheKey] = {
        data: commitData,
        expiry: Date.now() + CACHE_DURATION,
      };

      return res.status(200).json(commitData);
    } else {
      return res.status(404).json({ error: "No recent commits found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
