import { HIGH_PRIORITY_FEE } from "@/app/constants/fee";
import { getRecentPrioritizationFees } from "@/app/queries/getPriorityFeeEstimate";
import { CONNECTION } from "@/app/utils/solana";
import { ComputeBudgetProgram, PublicKey, Transaction } from "@solana/web3.js";

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
  const computeUnitFix = 4960;

  // Buffer to make sure the transaction doesn't fail because of less compute units
  const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
    units: Math.round(computeUnitFix * 1.1),
  });
  tx.add(modifyComputeUnits);

  let estimateFee = await getRecentPrioritizationFees(tx);

  // Verify the estimateFee is not null due to RPC request failure in some cases
  if (estimateFee === null) {
    for (let i = 0; i < 2; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      estimateFee = await getRecentPrioritizationFees(tx);
      if (estimateFee !== null) break;
    }

    // Set median priority fee if estimateFee is still null
    if (estimateFee === null) {
      estimateFee = {
        result: {
          priorityFeeLevels: {
            high: HIGH_PRIORITY_FEE,
          },
        },
      };
    }
  }

  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: Math.round(estimateFee?.result?.priorityFeeLevels?.high),
  });

  tx.add(addPriorityFee);

  return tx;
}
