import { useState, useEffect } from "react";
import { CardWrapper } from "../card";
import { Typography } from "../ui/typography";
import { Skeleton } from "../ui/skeleton";
import { GitHubIcon } from "@/assets/icons/social";

import { formatDistanceToNow, parseISO } from "date-fns";

interface CommitProps {
  message: string;
  date: string;
  url: string;
  repo: string;
}

interface FetchError {
  message: string;
}

export const LatestCommitCard: React.FC = () => {
  const [commit, setCommit] = useState<CommitProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FetchError | null>(null);

  useEffect(() => {
    const fetchCommit = async () => {
      try {
        const res = await fetch("/api/github/latest-commit");
        if (!res.ok) {
          throw new Error("Failed to fetch latest commit");
        }
        const data = await res.json();
        setCommit(data);
      } catch (err: any) {
        setError({ message: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchCommit();
  }, []);

  if (loading) {
    return (
      <CardWrapper
        title="Latest Commit"
        description="Loading..."
        footerText="Please wait"
        footer={true}
        icon={<GitHubIcon />}
      >
        <Skeleton className="w-3/4 h-[20px] rounded-full" />
      </CardWrapper>
    );
  }

  if (error) {
    return (
      <CardWrapper
        title="Latest Commit"
        description="Error"
        footerText={"Unable to load commit"}
        footer={true}
        icon={<GitHubIcon />}
      >
        <Typography variant="muted">{error.message}</Typography>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      title="Latest Commit"
      description={commit ? commit.repo : "No recent commits"}
      footerText={
        commit
          ? formatDistanceToNow(parseISO(commit.date), { addSuffix: true })
          : ""
      }
      footer={!!commit}
      href={commit ? commit.url : "#"}
      icon={<GitHubIcon />}
    >
      {commit && (
        <>
          <Typography variant="small" className="font-bold">
            {commit.message}
          </Typography>
        </>
      )}
    </CardWrapper>
  );
};
