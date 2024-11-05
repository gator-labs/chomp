import { VersionedTransaction } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import bs58 from "bs58";

/**
 * Get dynamic priority fees for a transaction
 * @param {Transaction | VersionedTransaction} tx - The transaction to process.
 * @returns {{
 *   jsonrpc: '2.0',
 *   result: {
 *     priorityFeeLevels: {
 *       min: number,
 *       low: number,
 *       medium: number,
 *       high: number,
 *       veryHigh: number,
 *       unsafeMax: number
 *     }
 *   } | null
 * }} The result object containing priority fee levels or null.
 */

export const getRecentPrioritizationFees = async (
  tx: Transaction | VersionedTransaction,
) => {
  try {
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
            transaction: bs58.encode(
              tx.serialize({
                requireAllSignatures: false,
                verifySignatures: false,
              }),
            ),
            options: {
              includeAllPriorityFeeLevels: true,
            },
          },
        ],
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("PriorityFeeEstimateError", error);
    return null;
  }
};
