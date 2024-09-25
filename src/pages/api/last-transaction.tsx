import { NextApiRequest, NextApiResponse } from "next";
import Moralis from "moralis";

let transactionCache: {
  [key: string]: { data: any; expiry: number };
} = {};

const CACHE_DURATION = 720 * 1000; // 12 minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const cacheKey = "lastTransaction";

    if (
      transactionCache[cacheKey] &&
      Date.now() < transactionCache[cacheKey].expiry
    ) {
      console.log("Serving from cache");
      return res.status(200).json(transactionCache[cacheKey].data);
    }

    const response = await Moralis.EvmApi.wallets.getWalletHistory({
      chain: "0xa4b1",
      order: "DESC",
      address: "0xe99B5a6403e8E0d7f75B1af421d1415A913DF588",
      limit: 1,
    });

    const data = response.result;

    if (data && data.length > 0) {
      const transactions = data.map((tx) => ({
        hash: tx.hash,
        from_address: tx.fromAddress,
        to_address: tx.toAddress,
        to_address_label: tx.toAddressLabel,
        method_label: tx.methodLabel,
        transaction_fee: tx.transactionFee,
        value: tx.value,
        summary: tx.summary,
        category: tx.category,
        block_timestamp: tx.blockTimestamp,
        token_transfers: tx.erc20Transfers.map((transfer) => ({
          token_name: transfer.tokenName,
          token_symbol: transfer.tokenSymbol,
          value_formatted: transfer.valueFormatted,
        })),
      }));

      transactionCache[cacheKey] = {
        data: { transactions },
        expiry: Date.now() + CACHE_DURATION,
      };

      return res.status(200).json({ transactions });
    } else {
      return res.status(404).json({ error: "No transaction history found" });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
