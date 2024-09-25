import { useState, useEffect } from "react";
import { CardWrapper } from "../card";
import { Typography } from "../ui/typography";
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ArbitrumIcon } from "@/assets/icons/social";

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

interface FetchError {
  message: string;
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
