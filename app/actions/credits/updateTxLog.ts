import prisma from "@/app/services/prisma";
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
  await prisma.fungibleAssetTransactionLog.create({
    data: {
      chainTxHash: hash,
      asset: FungibleAsset.Credit,
      change: deckCost,
      userId: userId,
      type: TransactionLogType.CreditPurchase,
    },
  });
};
