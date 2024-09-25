import { useState, useEffect } from "react";
import { CardWrapper } from "../card";
import { NetworkIcons } from "../contracts/network-icons";
import { Typography } from "../ui/typography";
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ArbitrumIcon, EthereumIcon, GitHubIcon } from "@/assets/icons/social";
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

interface Transaction {
  hash: string;
  from_address: string;
  to_address: string;
  to_address_label: string;
  method_label: string;
  transaction_fee: number;
  value: number;
  summary: string;
  category: string;
  block_timestamp: string;
  token_transfers: {
    value_formatted: string;
    token_symbol: string;
  }[];
}

export const TransactionCard: React.FC = () => {
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FetchError | null>(null);

  useEffect(() => {
    const fetchLastTransaction = async () => {
      try {
        const res = await fetch("/api/last-transaction");
        if (!res.ok) {
          throw new Error("Failed to fetch latest transaction");
        }
        const data = await res.json();
        if (data.transactions && data.transactions.length > 0) {
          setLastTransaction(data.transactions[0]);
        } else {
          setLastTransaction(null);
        }
      } catch (err: any) {
        setError({ message: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchLastTransaction();
  }, []);

  if (loading) {
    return (
      <CardWrapper
        title="Latest Transaction"
        description="Loading..."
        footerText="Please wait"
        footer={true}
        icon={<ArbitrumIcon />}
      >
        <Skeleton className="w-3/4 h-[20px] rounded-full" />
      </CardWrapper>
    );
  }

  if (error) {
    return (
      <CardWrapper
        title="Latest Transaction"
        description="Error"
        footerText={"Unable to load transaction"}
        footer={true}
        icon={<ArbitrumIcon />}
      >
        <Typography variant="muted">{error.message}</Typography>
      </CardWrapper>
    );
  }

  if (!lastTransaction) {
    return (
      <CardWrapper
        title="Latest Transaction"
        description="No transaction available"
        footerText=""
        footer={false}
        icon={<ArbitrumIcon />}
      >
        <Typography variant="muted">No transaction data found.</Typography>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      title="Latest Transaction"
      description={
        lastTransaction.to_address_label
          ? lastTransaction.to_address_label
          : `Fee: ${lastTransaction.transaction_fee} ETH`
      }
      footerText={formatDistanceToNow(
        parseISO(lastTransaction.block_timestamp),
        {
          addSuffix: true,
        }
      )}
      footer={true}
      href={`https://arbiscan.io/tx/${lastTransaction.hash}`}
      icon={<ArbitrumIcon />}
    >
      <Typography variant="small" className="font-bold">
        {lastTransaction.summary}
      </Typography>
    </CardWrapper>
  );
};
