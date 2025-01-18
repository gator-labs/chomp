"use server";

import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { sleep } from "@/app/utils/sleep";
import { ChainTxStatusUpdateError } from "@/lib/error";
import {
  EChainTxStatus,
  FungibleAsset,
  TransactionLogType,
} from "@prisma/client";
import pRetry from "p-retry";

const MAX_RETRIES = 3;

/**
 * Update the chain transaction status to finalized and create Credit FATL
 *
 * @param hash - The hash of the transaction
 * @param creditAmount - The amount of credits purchased
 * @throws Error if transaction fails to update
 */
export async function updateTxStatusToFinalized(
  hash: string,
  creditAmount: number,
  feesInSOL: number | undefined,
) {
  const payload = await getJwtPayload();

  if (!payload) throw new Error("Unauthorized access");

  const userId = payload.sub;

  try {
    await pRetry(
      async () => {
        await prisma.$transaction(async (tx) => {
          await tx.chainTx.update({
            where: { hash },
            data: {
              status: EChainTxStatus.Finalized,
              finalizedAt: new Date(),
              feeSolAmount: feesInSOL ? feesInSOL.toString() : undefined,
            },
          });

          await tx.fungibleAssetTransactionLog.create({
            data: {
              chainTxHash: hash,
              asset: FungibleAsset.Credit,
              change: creditAmount,
              type: TransactionLogType.CreditPurchase,
              userId: userId,
            },
          });
        });
      },
      {
        retries: MAX_RETRIES,
        onFailedAttempt: () => {
          sleep(3000);
        },
      },
    );
  } catch {
    throw new ChainTxStatusUpdateError(
      "Error updating Chain Tx to finalized status",
    );
  }
}
