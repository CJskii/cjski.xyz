import { useState, useEffect } from "react";
import { CardWrapper } from "../card";
import { NetworkIcons } from "../contracts/network-icons";
import { Typography } from "../ui/typography";
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow, parseISO } from "date-fns";
import { EthereumIcon, GitHubIcon } from "@/assets/icons/social";
import { FolderGit2 } from "lucide-react";

interface CommitProps {
  message: string;
  date: string;
  url: string;
  repo: string;
}

interface FetchError {
  message: string;
}

export const DeployedContractsCard: React.FC = () => {
  return (
    <CardWrapper
      title="Smart contracts"
      description="Deployed on mainnet"
      footerText="View all deployments"
      href="/contracts"
      footer={true}
      icon={<EthereumIcon />}
    >
      <NetworkIcons display="6" />
    </CardWrapper>
  );
};

export const LatestCommitCard: React.FC = () => {
  const [commit, setCommit] = useState<CommitProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FetchError | null>(null);

  useEffect(() => {
    const fetchCommit = async () => {
      try {
        const res = await fetch("/api/latest-commit");
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
        footer={false}
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
        footerText={error.message}
        footer={false}
        icon={<GitHubIcon />}
      >
        <Typography variant="muted">Unable to load commit</Typography>
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

export const ProjectsCard: React.FC = () => {
  return (
    <CardWrapper
      title="Projects"
      description="Deployed on mainnet"
      footerText="View all projects"
      href="/projects"
      footer={true}
      icon={<FolderGit2 />}
    >
      <Typography variant="small">Card Content</Typography>
    </CardWrapper>
  );
};
