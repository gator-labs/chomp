import { HIGH_PRIORITY_FEE } from "@/app/constants/fee";
import { getRecentPrioritizationFees } from "@/app/queries/getPriorityFeeEstimate";
import { sleep } from "@/app/utils/sleep";
import { CONNECTION } from "@/app/utils/solana";
import { ComputeBudgetProgram, PublicKey, Transaction } from "@solana/web3.js";
import pRetry from "p-retry";

const MAX_RETRIES = 3;

/**
 * Sets up the transaction priority fee for a Solana transaction
 *
 * @param tx - The transaction object to set up
 * @param feePayer - The public key of the fee payer
 *
 * @returns The CU optimized and priority fee set transaction object
 */
export async function setupTransactionPriorityFee(
  tx: Transaction,
  feePayer: PublicKey,
) {
  const { blockhash, lastValidBlockHeight } =
    await CONNECTION.getLatestBlockhash("confirmed");

  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = feePayer;

  // It is recommended to add the compute limit instruction before adding other instructions
  const computeUnitFix = 2000;

  // Buffer to make sure the transaction doesn't fail because of less compute units
  const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
    units: Math.round(computeUnitFix * 1.1),
  });
  tx.add(modifyComputeUnits);

  let estimateFee;

  try {
    estimateFee = await pRetry(
      async () => {
        const fee = await getRecentPrioritizationFees(tx);
        if (fee === null) {
          throw new Error("Failed to get priority fee estimate");
        }
        return fee;
      },
      {
        retries: MAX_RETRIES,
        onFailedAttempt: () => {
          sleep(3000);
        },
      },
    );
  } catch {
    estimateFee = {
      result: {
        priorityFeeLevels: {
          high: HIGH_PRIORITY_FEE,
        },
      },
    };
  }

  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: Math.round(estimateFee?.result?.priorityFeeLevels?.high),
  });

  tx.add(addPriorityFee);

  return tx;
}
