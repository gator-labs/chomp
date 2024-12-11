import { validateBonkBurned } from "@/app/actions/validateBonkBurn";
import prisma from "@/app/services/prisma";
import { calculateReward } from "@/app/utils/algo";
import { RevealConfirmationError } from "@/lib/error";
import { ResultType, TransactionStatus } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { startOfDay, sub } from "date-fns";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const SECRET = process.env.CRON_SECRET || "";
  if (authHeader !== `Bearer ${SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  const currentTime = new Date();
  const oneWeekAgo = sub(currentTime, { days: 7 });
  const tenMinutesAgo = sub(currentTime, { minutes: 10 });
  try {
    // Fetch all pending transactions grouped by burnTransactionSignature
    const pendingTransactions = await prisma.chompResult.findMany({
      where: {
        transactionStatus: "Pending",
        createdAt: {
          gte: startOfDay(oneWeekAgo), // Start of the day 7 days ago
          lte: tenMinutesAgo, // 10 minutes ago
        },
        needsManualReview: null,
      },
      include: {
        question: {
          select: {
            revealTokenAmount: true,
          },
        },
      },
    });
    const groupedByBurnSignature = pendingTransactions.reduce(
      (groups, transaction) => {
        const { burnTransactionSignature } = transaction;
        if (!burnTransactionSignature) return groups;

        if (!groups[burnTransactionSignature]) {
          groups[burnTransactionSignature] = [];
        }
        groups[burnTransactionSignature].push(transaction);
        return groups;
      },
      {} as Record<string, typeof pendingTransactions>,
    );

    // Process each group
    for (const burnTx in groupedByBurnSignature) {
      const transactions = groupedByBurnSignature[burnTx];

      const userId = transactions[0].userId;

      const revealableQuestionIds = transactions.map(
        (rq) => rq.questionId || 0,
      );
      const wallets = (
        await prisma.wallet.findMany({
          where: {
            userId,
          },
        })
      ).map((wallet) => wallet.address);

      const isValid = await validateBonkBurned(burnTx, wallets, SECRET);

      if (isValid) {
        const questionRewards = await calculateReward(
          userId,
          revealableQuestionIds,
        );
        await prisma.$transaction(async (tx) => {
          await tx.chompResult.deleteMany({
            where: {
              AND: {
                userId: userId,
                questionId: {
                  in: revealableQuestionIds,
                },
                burnTransactionSignature: burnTx,
                transactionStatus: TransactionStatus.Pending,
              },
            },
          });

          await tx.chompResult.createMany({
            data: [
              ...questionRewards.map((questionReward) => ({
                questionId: questionReward.questionId,
                userId: userId,
                result: ResultType.Revealed,
                burnTransactionSignature: burnTx,
                rewardTokenAmount: questionReward.rewardAmount,
                transactionStatus: TransactionStatus.Completed,
              })),
            ],
          });
        });
      } else {
        await prisma.chompResult.updateMany({
          where: {
            burnTransactionSignature: burnTx,
            transactionStatus: TransactionStatus.Pending,
            userId: userId,
          },
          data: {
            needsManualReview: true,
          },
        });
        const revealError = new RevealConfirmationError(
          `Unable to validate tx for User id: ${userId} and (wallet: ${wallets})`,
        );
        Sentry.captureException(revealError, {
          tags: {
            category: "reveal-tx-validation-error",
          },
        });
      }
    }
    return new Response("Ok", { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
