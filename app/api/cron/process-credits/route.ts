import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import prisma from "@/app/services/prisma";
import { verifyCreditPayment } from "@/lib/credits/verifyCreditPayment";
import { CreditTransactionValidationError } from "@/lib/error";
import { getWalletOwner } from "@/lib/wallet";
import {
  EChainTxStatus,
  FungibleAsset,
  TransactionLogType,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { startOfDay, sub } from "date-fns";

/**
 * This API processes pending credit purchase transactions that fall within
 * the 1 week to 10 minutes before the current time.
 *
 * Actions performed:
 * 1. Attempts to validate the payment transaction hash
 * 2. If successful, marks the chainTx as `finalized` and adds credits to user
 * 3. If unsuccessful, logs error to Sentry
 */

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET || "";

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const currentTime = new Date();
  const threeDaysAgo = sub(currentTime, { days: 7 });

  try {
    // Fetch all new transactions within specific date range
    const pendingTransactions = await prisma.chainTx.findMany({
      take: 10,
      where: {
        status: EChainTxStatus.New,
        createdAt: {
          gte: startOfDay(threeDaysAgo),
        },
        failedAt: null,
      },
    });

    for (const tx of pendingTransactions) {
      const isValid = await verifyCreditPayment(tx.hash);

      if (isValid) {
        const walletOwner = await getWalletOwner(tx.wallet);

        if (!walletOwner) {
          throw new Error("Wallet owner not found");
        }

        // Update chainTx status and add credits
        await prisma.$transaction(async (prisma) => {
          await prisma.chainTx.update({
            where: {
              hash: tx.hash,
              status: EChainTxStatus.New,
            },
            data: {
              status: EChainTxStatus.Finalized,
              finalizedAt: new Date(),
            },
          });

          // Add credits based on solAmount
          const creditAmount = Number(tx.solAmount) * 1000; // Credits per SOL
          await prisma.fungibleAssetTransactionLog.create({
            data: {
              userId: walletOwner,
              change: creditAmount,
              type: TransactionLogType.CreditPurchase,
              asset: FungibleAsset.Credit,
              chainTxHash: tx.hash,
            },
          });
        });
      } else {
        await prisma.chainTx.update({
          where: {
            hash: tx.hash,
          },
          data: {
            failedAt: new Date(),
          },
        });
        const validationError = new CreditTransactionValidationError(
          `Failed to validate credit purchase transaction hash: ${tx.hash}`,
        );
        Sentry.captureException(validationError, {
          tags: {
            category: "credit-purchase-validation-error",
          },
          extra: {
            transactionHash: tx.hash,
            wallet: tx.wallet,
            solAmount: tx.solAmount,
          },
        });
        await Sentry.flush(SENTRY_FLUSH_WAIT);
      }
    }

    return new Response("Processed successfully", { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
