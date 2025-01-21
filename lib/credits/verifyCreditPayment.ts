import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import prisma from "@/app/services/prisma";
import { VerifyPaymentError } from "@/lib/error";
import { VerificationResult } from "@/types/credits";
import { EChainTxStatus } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import "server-only";

import { verifyTransactionInstructions } from "../verifyTransactionInstructions";
import { getWalletOwner } from "../wallet";

export async function verifyCreditPayment(txHash: string) {
  const record = await prisma.chainTx.findFirst({
    where: {
      hash: txHash,
      status: EChainTxStatus.New,
      failedAt: null,
    },
  });

  if (!record) {
    return false;
  }

  const user = await prisma.wallet.findUnique({
    where: {
      address: record.wallet,
    },
  });

  if (!user) {
    return false;
  }

  let verificationResult: VerificationResult;

  try {
    verificationResult = await verifyTransactionInstructions(
      txHash,
      record.solAmount,
    );

    if (!verificationResult.success) {
      throw new Error(verificationResult.error);
    }

    const walletOwner = await getWalletOwner(verificationResult.wallet!);

    if (
      walletOwner !== user.userId ||
      record.wallet !== verificationResult.wallet
    ) {
      return false;
    }
  } catch (error) {
    const verifyPaymentError = new VerifyPaymentError(
      `Unable to verify SOL payment for user ${user.userId}, tx ${record?.hash}`,
      { cause: error },
    );
    Sentry.captureException(verifyPaymentError);
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    return false;
  }

  if (!verificationResult.success) {
    Sentry.captureMessage(
      `Verification of SOL payment for user ${user?.userId} failed. Transaction: https://solana.fm/tx/${record?.hash}`,
      {
        level: "error",
        tags: {
          category: "sol-payment-not-verified",
        },
        extra: {
          record,
        },
      },
    );
    await Sentry.flush(SENTRY_FLUSH_WAIT);
  }

  return verificationResult.success;
}
