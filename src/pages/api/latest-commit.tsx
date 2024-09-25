import { NextApiRequest, NextApiResponse } from "next";

let commitCache: {
  [key: string]: { data: any; expiry: number };
} = {};

const CACHE_DURATION = 720 * 1000; // 12 minutes

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

  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/events/public`
    );

    const events = await response.json();

    const pushEvent = events.find((event: any) => event.type === "PushEvent");

    if (pushEvent && pushEvent.payload.commits.length > 0) {
      const latestCommit = pushEvent.payload.commits[0];
      const commitData = {
        message: latestCommit.message,
        date: pushEvent.created_at,
        repo: pushEvent.repo.name,
        url: `https://github.com/${pushEvent.repo.name}/commit/${latestCommit.sha}`,
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
