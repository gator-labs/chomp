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
import "server-only";

const MAX_RETRIES = 3;

/**
 * Update the chain transaction status to confirmed
 *
 * @param hash - The hash of the transaction
 * @throws Error if transaction fails to update
 */
export async function updateTxStatusToConfirmed(
  hash: string,
  creditAmount: number,
) {
  const payload = await getJwtPayload();

  if (!payload) {
    return {
      error: "User not authenticated",
    };
  }

  const userId = payload.sub;

  try {
    await pRetry(
      async () => {
        await prisma.$transaction(async (tx) => {
          await tx.chainTx.update({
            where: { hash },
            data: {
              status: EChainTxStatus.Confirmed,
            },
          });

          await tx.fungibleAssetTransactionLog.create({
            data: {
              chainTxHash: hash,
              asset: FungibleAsset.Credit,
              change: creditAmount,
              type: TransactionLogType.CreditPurchase,
              userId,
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
    throw new ChainTxStatusUpdateError("Error updating to confirmed status");
  }
}
