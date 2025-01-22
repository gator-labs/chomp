"use server";

import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { sleep } from "@/app/utils/sleep";
import { ChainTxStatusUpdateError } from "@/lib/error";
import { EChainTxStatus } from "@prisma/client";
import pRetry from "p-retry";

const MAX_RETRIES = 3;

/**
 * Update the chain transaction status to confirmed
 *
 * @param hash - The hash of the transaction
 * @throws Error if transaction fails to update
 */
export async function updateTxStatusToConfirmed(hash: string) {
  const payload = await getJwtPayload();

  if (!payload) {
    return {
      error: "User not authenticated",
    };
  }

  try {
    await pRetry(
      async () => {
        await prisma.chainTx.update({
          where: { hash },
          data: {
            status: EChainTxStatus.Confirmed,
          },
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
