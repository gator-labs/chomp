"use server";

import prisma from "@/app/services/prisma";
import { ChainTxStatusUpdateError } from "@/lib/error";
import {
  EChainTxStatus,
  FungibleAsset,
  TransactionLogType,
} from "@prisma/client";

import { getJwtPayload } from "../jwt";

const MAX_RETRIES = 3;
const DELAY_MS = 5000;

/**
 * Update the chain transaction status to confirmed
 *
 * @param hash - The hash of the transaction
 * @throws Error if transaction fails to update
 */
export async function updateTxStatusToConfirmed(hash: string) {
  let attempt = 0;
  let success = false;

  const payload = await getJwtPayload();

  if (!payload) throw new Error("Unauthorized access");

  while (attempt < MAX_RETRIES && !success) {
    attempt++;
    try {
      await prisma.chainTx.update({
        where: { hash },
        data: { status: EChainTxStatus.Confirmed, hash },
      });
      success = true;
    } catch {
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, DELAY_MS));
      } else {
        throw new ChainTxStatusUpdateError(
          "Error updating to confirmed status",
        );
      }
    }
  }
}

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
) {
  let attempt = 0;
  let success = false;

  const payload = await getJwtPayload();

  if (!payload) throw new Error("Unauthorized access");

  const userId = payload.sub;

  while (attempt < MAX_RETRIES && !success) {
    attempt++;
    try {
      await prisma.$transaction(async (tx) => {
        // Update chain transaction status
        await tx.chainTx.update({
          where: { hash },
          data: {
            status: EChainTxStatus.Finalized,
            finalizedAt: new Date(),
            hash,
          },
        });

        // Create transaction log for credits
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

      success = true;
    } catch {
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, DELAY_MS));
      } else {
        throw new ChainTxStatusUpdateError(
          "Error updating to finalized status",
        );
      }
    }
  }
}
