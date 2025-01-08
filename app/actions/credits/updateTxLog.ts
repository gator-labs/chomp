import prisma from "@/app/services/prisma";
import { FungibleAsset, TransactionLogType } from "@prisma/client";
import "server-only";

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
