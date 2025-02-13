import { getJwtPayload } from "@/app/actions/jwt";
import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import { TRANSACTION_COMMITMENT } from "@/app/constants/solana";
import { CONNECTION } from "@/app/utils/solana";
import { updateTxStatusToConfirmed } from "@/lib/credits/updateTxStatusConfirm";
import { verifyPayment } from "@/lib/credits/verifyPayment";
import * as Sentry from "@sentry/nextjs";
import pRetry from "p-retry";
import "server-only";

import { TransactionFailedToConfirmError } from "../error";

const CONFIRMATION_OPTIONS = {
  retries: 2,
};

/**
 * Send signed transaction on-chain and handle confirmation and finalization
 *
 * @param signedTransaction - Searlized and base64 encoded transaction after user signs
 * @param creditsToBuy - Number of credits the user wants to purchase
 *
 * @throws Error if transaction simulation fails to send or confirm
 */
export async function processTransaction(
  signedTransaction: string,
  creditsToBuy: number,
) {
  const payload = await getJwtPayload();

  if (!payload) {
    return {
      error: "User not authenticated",
    };
  }

  // Send transaction
  const txHash = await CONNECTION.sendEncodedTransaction(signedTransaction, {
    skipPreflight: true,
  });

  try {
    // Wait for confirmation
    await pRetry(async () => {
      const currentBlockhash = await CONNECTION.getLatestBlockhash();
      await CONNECTION.confirmTransaction(
        {
          signature: txHash,
          ...currentBlockhash,
        },
        TRANSACTION_COMMITMENT,
      );

      // Checks that tx has been confirmed
      if (!(await verifyPayment(txHash))) {
        throw new Error("Payment could not be verified");
      }

      // Update chain tx status to confirmed
      await updateTxStatusToConfirmed(txHash, creditsToBuy);
    }, CONFIRMATION_OPTIONS);
  } catch (error) {
    const transactionFailedToConfirmError = new TransactionFailedToConfirmError(
      `Credit Transaction Confirmation failed for user: ${payload?.sub}`,
      { cause: error },
    );
    Sentry.captureException(transactionFailedToConfirmError, {
      extra: {
        creditAmount: creditsToBuy,
        signature: txHash,
      },
    });
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    throw new Error("Transaction failed to confirm");
  }
}
