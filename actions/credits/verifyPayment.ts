import { getJwtPayload } from "@/app/actions/jwt";
import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import prisma from "@/app/services/prisma";
import { VerifyPaymentError } from "@/lib/error";
import { verifyTransactionInstructions } from "@/lib/verifyTransactionInstructions";
import { VerificationResult } from "@/types/credits";
import { EChainTxStatus } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import "server-only";

import { getWalletOwner } from "../../lib/wallet";

export async function verifyPayment(txHash: string) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const record = await prisma.chainTx.findFirst({
    where: {
      hash: txHash,
      status: EChainTxStatus.New,
    },
  });

  if (!record) {
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
      walletOwner !== payload.sub ||
      record.wallet !== verificationResult.wallet
    ) {
      return false;
    }
  } catch (error) {
    const verifyPaymentError = new VerifyPaymentError(
      `Unable to verify SOL payment for user ${payload.sub}, tx ${record?.hash}`,
      { cause: error },
    );
    Sentry.captureException(verifyPaymentError);
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    return false;
  }

  if (!verificationResult.success) {
    Sentry.captureMessage(
      `Verification of SOL payment for user ${payload.sub} failed. Transaction: https://solana.fm/tx/${record?.hash}`,
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
