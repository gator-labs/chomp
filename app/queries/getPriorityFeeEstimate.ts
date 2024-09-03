import { Transaction } from "@solana/web3.js";

export const getRecentPrioritizationFees = async (tx: Transaction) => {
  const response = await fetch(process.env.NEXT_PUBLIC_RPC_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getPriorityFeeEstimate",
      params: [
        {
          options: {
            transaction: tx,
            includeAllPriorityFeeLevels: true,
          },
        },
      ],
    }),
  });
  const data = await response.json();
  return data;
};
