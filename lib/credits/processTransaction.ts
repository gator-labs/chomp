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
  const startTime = Date.now();
  let lastLogTime = startTime;

  const logStep = (stepName: string) => {
    const now = Date.now();
    const stepDuration = ((now - lastLogTime) / 1000).toFixed(2);
    const totalDuration = ((now - startTime) / 1000).toFixed(2);
    console.log(
      `ProcessTransaction - ${stepName}\n` +
      `Step duration: ${stepDuration}s\n` +
      `Total duration: ${totalDuration}s\n` +
      '------------------------'
    );
    lastLogTime = now;
  };

  logStep('Starting processTransaction');
  
  const payload = await getJwtPayload();
  if (!payload) {
    return {
      error: "User not authenticated",
    };
  }
  logStep('JWT payload retrieved');

  // Send transaction
  const txHash = await CONNECTION.sendRawTransaction(
    signedTransaction.serialize(),
    {
      skipPreflight: true,
    },
  );
  logStep('Transaction sent');

  try {
    // Wait for confirmation
    await pRetry(async () => {
      logStep('Starting confirmation attempt');
      const currentBlockhash = await CONNECTION.getLatestBlockhash();
      await CONNECTION.confirmTransaction(
        {
          signature: txHash,
          ...currentBlockhash,
        },
        "confirmed",
      );
      logStep('Transaction confirmed');

      if (!(await verifyPayment(txHash))) {
        throw new Error("Payment could not be verified");
      }
      logStep('Payment verified');

      // Update chain tx status to confirmed
      await updateTxStatusToConfirmed(txHash);
      logStep('Chain tx status updated to confirmed');
    }, CONFIRMATION_OPTIONS);
  } catch (error) {
    logStep('Confirmation failed');
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
      logStep('Starting finalization attempt');
      let feesInSOL;
      const latestBlockhash = await CONNECTION.getLatestBlockhash();
      // await CONNECTION.confirmTransaction(
      //   {
      //     signature: txHash,
      //     ...latestBlockhash,
      //   },
      //   "finalized",
      // );
      // logStep('Transaction finalized');

      const txInfo = await CONNECTION.getTransaction(txHash, {
        maxSupportedTransactionVersion: 0,
      });
      logStep('Transaction info retrieved');

      const fees = txInfo?.meta?.fee;

      if (fees) {
        feesInSOL = fees / LAMPORTS_PER_SOL;
      }

      // Update chain tx status to finalized
      await updateTxStatusToFinalized(txHash, creditsToBuy, feesInSOL);
      logStep('Chain tx status updated to finalized');
    }, CONFIRMATION_OPTIONS);

    setIsProcessingTx(false);
  } catch (error) {
    logStep('Finalization failed');
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
