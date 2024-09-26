import { useEffect, useState } from "react";
import { CardWrapper, GithubRepoCard } from "../card";
import { Typography } from "../ui/typography";
import { Skeleton } from "../ui/skeleton";

interface Repo {
  name: string;
  description: string;
  updatedAt: string;
  lastCommitDate: string;
  primaryLanguage: string;
  primaryLanguageColor: string;
  stargazerCount: number;
  forkCount: number;
  license: string;
  url: string;
}

export const FeaturedRepos: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPinnedRepos = async () => {
      try {
        const response = await fetch("/api/github/pinned-repos");
        if (!response.ok) {
          throw new Error("Failed to fetch pinned repositories");
        }
        const data = await response.json();
        setRepos(data.pinnedRepos);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPinnedRepos();
  }, []);

  if (loading)
    return (
      <div className="grid md:grid-cols-2 col-span-2 gap-4">
        <CardWrapper
          title="Loading"
          description="Fetching featured repositories"
          footerText="Please wait"
          footer={true}
        >
          <Skeleton className="w-full h-20 rounded-md" />
        </CardWrapper>
        <CardWrapper
          title="Loading"
          description="Fetching featured repositories"
          footerText="Please wait"
          footer={true}
        >
          <Skeleton className="w-full h-20 rounded-md" />
        </CardWrapper>
      </div>
    );
  if (error)
    return (
      <Typography
        variant="paragraph"
        className="text-center text-destructive col-span-2"
      >
        Error: {error}
      </Typography>
    );

  return (
    <div className="grid gap-4 md:grid-cols-2 col-span-2">
      {repos.map((repo: Repo) => (
        <GithubRepoCard
          key={repo.name}
          name={repo.name}
          description={repo.description}
          url={repo.url}
          lastCommitDate={repo.lastCommitDate}
          primaryLanguage={repo.primaryLanguage}
          primaryLanguageColor={repo.primaryLanguageColor}
        />
      ))}
    </div>
  );
};
