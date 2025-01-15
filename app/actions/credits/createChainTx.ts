"use server";

import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import prisma from "@/app/services/prisma";
import { getTreasuryPublicKey } from "@/lib/constant";
import { CreateChainTxError } from "@/lib/error";
import { EChainTxStatus, EChainTxType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

import { getJwtPayload } from "../jwt";

/**
 * Creates initial chainTx record when user signs a credit purchase transaction
 *
 * @param creditsToBuy The amount of credits being purchased
 *
 * @param signature Transaction signature after user signs
 *
 * @returns Created chainTx record or error
 */

export async function createSignedSignatureChainTx(
  creditsToBuy: number,
  signature: string,
) {
  const payload = await getJwtPayload();

  if (!payload) {
    return {
      error: "User not authenticated",
    };
  }

  const SOLANA_COST_PER_CREDIT = process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT;

  if (!SOLANA_COST_PER_CREDIT) {
    return {
      error: "Invalid SOL cost per credit.",
    };
  }

  const solAmount = Number(SOLANA_COST_PER_CREDIT) * creditsToBuy;

  const wallet = await prisma.wallet.findFirst({
    where: {
      userId: payload.sub,
    },
    select: {
      address: true,
    },
  });

  if (!wallet) {
    return {
      error: "Wallet not found, please connect your wallet",
    };
  }

  const treasuryAddress = getTreasuryPublicKey();

  if (!treasuryAddress) {
    return {
      error: "Invalid treasury address",
    };
  }

  try {
    await prisma.chainTx.create({
      data: {
        hash: signature,
        status: EChainTxStatus.New,
        solAmount: String(solAmount),
        wallet: wallet?.address,
        feeSolAmount: "0",
        recipientAddress: treasuryAddress,
        type: EChainTxType.CreditPurchase,
      },
    });
  } catch (error) {
    const createChainTxError = new CreateChainTxError(
      `Unable to create Chain Tx for user ${payload.sub}`,
      { cause: error },
    );
    Sentry.captureException(createChainTxError, {
      extra: {
        creditAmount: creditsToBuy,
        address: wallet.address,
        signature,
      },
    });
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    return {
      error:
        "Unable to prepare transaction. Don't worry, nothing was submitted on-chain. Please try again",
    };
  }
}
