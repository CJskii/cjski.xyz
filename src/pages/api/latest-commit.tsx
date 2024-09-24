import { NextApiRequest, NextApiResponse } from "next";

interface CommitData {
  message: string;
  date: string;
  repo: string;
  url: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const username = "CJskii";

  const response = await fetch(
    `https://api.github.com/users/${username}/events/public`
  );

  const events = await response.json();

  const pushEvent = events.find((event: any) => event.type === "PushEvent");

  if (pushEvent && pushEvent.payload.commits.length > 0) {
    const latestCommit = pushEvent.payload.commits[0];
    console.log(latestCommit);
    const commitData: CommitData = {
      message: latestCommit.message,
      date: pushEvent.created_at,
      repo: pushEvent.repo.name,
      url: `https://github.com/${pushEvent.repo.name}/commit/${latestCommit.sha}`,
    };
    res.status(200).json(commitData);
  } else {
    res.status(404).json({ error: "No recent commits found" });
  }
}
