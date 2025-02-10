import { updateTxStatusToConfirmed } from "@/actions/credits/updateTxStatusConfirm";
import { verifyPayment } from "@/actions/credits/verifyPayment";
import { getJwtPayload } from "@/app/actions/jwt";
import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import { TRANSACTION_COMMITMENT } from "@/app/constants/solana";
import { CONNECTION } from "@/app/utils/solana";
import * as Sentry from "@sentry/nextjs";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import pRetry from "p-retry";

import { TransactionFailedToConfirmError } from "../error";

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
        TRANSACTION_COMMITMENT,
      );

      // Checks that tx has been confirmed
      if (!(await verifyPayment(txHash))) {
        throw new Error("Payment could not be verified");
      }

      // Get fees in SOL
      let feesInSOL;

      const txInfo = await CONNECTION.getTransaction(txHash, {
        maxSupportedTransactionVersion: 0,
      });

      const fees = txInfo?.meta?.fee;

      if (fees) {
        feesInSOL = fees / LAMPORTS_PER_SOL;
      }

      // Update chain tx status to confirmed
      await updateTxStatusToConfirmed(txHash, creditsToBuy, feesInSOL);
    }, CONFIRMATION_OPTIONS);

    setIsProcessingTx(false);
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
