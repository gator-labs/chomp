import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import prisma from "@/app/services/prisma";
import { CreditTransactionValidationError } from "@/lib/error";
import { getWalletOwner } from "@/lib/wallet";
import { ChainTxResult, TransactionProcessingResult } from "@/types/credits";
import {
  EChainTxStatus,
  FungibleAsset,
  TransactionLogType,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import Decimal from "decimal.js";
import "server-only";

import { verifyCreditPayment } from "./verifyCreditPayment";

export async function processCreditsTransaction(
  tx: ChainTxResult,
): Promise<TransactionProcessingResult> {
  const solCostPerCredit = process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT;

  if (!solCostPerCredit) {
    return { success: false, error: "SOL cost per credit not defined" };
  }

  try {
    const isValid = await verifyCreditPayment(tx.hash);

    if (!isValid) {
      await prisma.chainTx.update({
        where: { hash: tx.hash },
        data: { failedAt: new Date() },
      });

      Sentry.captureException(
        new CreditTransactionValidationError(
          `Failed to validate credit purchase transaction hash: ${tx.hash}`,
        ),
        {
          tags: { category: "credit-purchase-validation-error" },
          extra: {
            wallet: tx.wallet,
            solAmount: tx.solAmount,
          },
        },
      );
      await Sentry.flush(SENTRY_FLUSH_WAIT);
      return { success: false, error: "Transaction validation failed" };
    }

    const walletOwner = await getWalletOwner(tx.wallet);

    if (!walletOwner) {
      await prisma.chainTx.update({
        where: { hash: tx.hash },
        data: { failedAt: new Date() },
      });

      Sentry.captureException(
        new CreditTransactionValidationError(
          `Wallet owner not found for transaction: ${tx.hash}`,
        ),
        {
          extra: {
            hash: tx.hash,
            wallet: tx.wallet,
            solAmount: tx.solAmount,
          },
        },
      );
      await Sentry.flush(SENTRY_FLUSH_WAIT);
      return { success: false, error: "Wallet owner not found" };
    }

    // Process the credit purchase
    const creditAmount = new Decimal(tx.solAmount)
      .div(new Decimal(solCostPerCredit))
      .toNumber();

    await prisma.$transaction([
      prisma.chainTx.update({
        where: {
          hash: tx.hash,
          status: EChainTxStatus.New,
        },
        data: {
          status: EChainTxStatus.Finalized,
          finalizedAt: new Date(),
        },
      }),
      prisma.fungibleAssetTransactionLog.create({
        data: {
          userId: walletOwner,
          change: creditAmount,
          type: TransactionLogType.CreditPurchase,
          asset: FungibleAsset.Credit,
          chainTxHash: tx.hash,
        },
      }),
    ]);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
