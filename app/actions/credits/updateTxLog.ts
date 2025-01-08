import prisma from "@/app/services/prisma";
import { CreditTxLogUpdateError } from "@/lib/error";
import { FungibleAsset, TransactionLogType } from "@prisma/client";
import "server-only";

/**
 * Add the credit purchase entry in transaction log table linked
 * to chain tx
 *
 * @param hash Chain Tx hash and primary key
 *
 * @param deckCost It represent the cost of deck for which user
 * is trying to purchase credit
 *
 * @param userId userId of the authenticated user.
 *
 */

export const updateTransactionLog = async (
  hash: string,
  deckCost: number,
  userId: string,
) => {
  const maxRetries = 6; // retry for 30 sec (6 attempts * 5 seconds)
  const delayMs = 500; // 5 seconds
  let attempt = 0;
  let success = false;

  while (attempt < maxRetries && !success) {
    attempt++;
    try {
      await prisma.fungibleAssetTransactionLog.create({
        data: {
          chainTxHash: hash,
          asset: FungibleAsset.Credit,
          change: deckCost,
          userId: userId,
          type: TransactionLogType.CreditPurchase,
        },
      });
      success = true;
    } catch {
      if (attempt < maxRetries) {
        // wait for delayMs before next retry
        await new Promise((r) => setTimeout(r, delayMs));
      }

      throw new CreditTxLogUpdateError("Error in updating tx log");
    }
  }
};
