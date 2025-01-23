import { updateTxStatusToConfirmed } from "@/actions/credits/updateTxStatusConfirm";
import { updateTxStatusToFinalized } from "@/actions/credits/updateTxStatusFinalized";
import { verifyPayment } from "@/actions/credits/verifyPayment";
import { getJwtPayload } from "@/app/actions/jwt";
import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import { CONNECTION } from "@/app/utils/solana";
import * as Sentry from "@sentry/nextjs";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import pRetry from "p-retry";

import {
  TransactionFailedToConfirmError,
  TransactionFailedToFinalizeError,
} from "../error";

const CONFIRMATION_OPTIONS = {
  retries: 2,
};

/**
 * Send signed transaction on-chain and handle confirmation and finalization
 *
 * @param signedTransaction - The signed transaction to be processed
 * @param creditsToBuy - Number of credits the user wants to purchase
 * @param setIsProcessingTx - Callback to update transaction processing state in UI
 *
 * @throws Error if transaction simulation fails to send or confirm
 */
export async function processTransaction(
  signedTransaction: Transaction,
  creditsToBuy: number,
  setIsProcessingTx: (isProcessingTx: boolean) => void,
) {
  const payload = await getJwtPayload();

  if (!payload) {
    return {
      error: "User not authenticated",
    };
  }

  // Send transaction
  const txHash = await CONNECTION.sendRawTransaction(
    signedTransaction.serialize(),
    {
      skipPreflight: true,
    },
  );

  try {
    // Wait for confirmation
    await pRetry(async () => {
      const currentBlockhash = await CONNECTION.getLatestBlockhash();
      await CONNECTION.confirmTransaction(
        {
          signature: txHash,
          ...currentBlockhash,
        },
        "confirmed",
      );

      if (!(await verifyPayment(txHash))) {
        throw new Error("Payment could not be verified");
      }

      // Update chain tx status to confirmed
      await updateTxStatusToConfirmed(txHash);
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

  try {
    // Wait for finalization
    await pRetry(async () => {
      let feesInSOL;
      const latestBlockhash = await CONNECTION.getLatestBlockhash();
      await CONNECTION.confirmTransaction(
        {
          signature: txHash,
          ...latestBlockhash,
        },
        "finalized",
      );

      const txInfo = await CONNECTION.getTransaction(txHash, {
        maxSupportedTransactionVersion: 0,
      });

      const fees = txInfo?.meta?.fee;

      if (fees) {
        feesInSOL = fees / LAMPORTS_PER_SOL;
      }

      // Update chain tx status to finalized
      await updateTxStatusToFinalized(txHash, creditsToBuy, feesInSOL);
    }, CONFIRMATION_OPTIONS);

    setIsProcessingTx(false);
  } catch (error) {
    const transactionFailedToFinalizeError =
      new TransactionFailedToFinalizeError(
        `Credit Transaction Finalization failed for user: ${payload?.sub}`,
        { cause: error },
      );
    Sentry.captureException(transactionFailedToFinalizeError, {
      extra: {
        creditAmount: creditsToBuy,
        signature: txHash,
      },
    });
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    throw new Error("Transaction failed to finalize");
  }
}
