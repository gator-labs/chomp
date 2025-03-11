import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import prisma from "@/app/services/prisma";
import { getSolPaymentAddress } from "@/app/utils/getSolPaymentAddress";
import { CreateChainTxError } from "@/lib/error";
import { EChainTxStatus, EChainTxType } from "@prisma/client";
import { CreditPack } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import Decimal from "decimal.js";
import "server-only";

import { getJwtPayload } from "../../app/actions/jwt";

Decimal.set({ toExpNeg: -128 });

/**
 * Creates initial chainTx record when user signs a credit purchase transaction
 *
 * @param creditsToBuy The amount of credits being purchased
 * @param signature Transaction signature after user signs
 * @param creditPack Credit pack used (if any)
 *
 * @returns Created chainTx record or error
 */

export async function createSignedSignatureChainTx(
  creditsToBuy: number,
  signature: string,
  creditPack: CreditPack | null = null,
) {
  const payload = await getJwtPayload();

  if (!payload) {
    return {
      error: "User not authenticated",
    };
  }

  const solanaCostPerCredit = creditPack
    ? creditPack.costPerCredit
    : process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT;

  if (!solanaCostPerCredit) {
    return {
      error: "SOLANA_COST_PER_CREDIT env var is not defined",
    };
  }

  const solAmount = new Decimal(solanaCostPerCredit).mul(creditsToBuy);

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

  const solPaymentAddress = await getSolPaymentAddress();

  if (!solPaymentAddress) {
    return {
      error: "SOL Payment Address is not defined",
    };
  }

  try {
    await prisma.chainTx.create({
      data: {
        hash: signature,
        status: EChainTxStatus.New,
        solAmount: solAmount.toString(),
        wallet: wallet?.address,
        recipientAddress: solPaymentAddress,
        type: EChainTxType.CreditPurchase,
        creditPackId: creditPack?.id,
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
