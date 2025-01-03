"use server";

import { QuestionMultiDecksError } from "@/lib/error";
import { FungibleAsset, TransactionLogType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";

import { pointsPerAction } from "../constants/points";
import prisma, { PrismaTransactionClient } from "../services/prisma";
import { authGuard } from "../utils/auth";
import { getJwtPayload } from "./jwt";

export const getTransactionHistory = async () => {
  const payload = await getJwtPayload();
  const userId = payload?.sub ?? "";

  if (!userId) {
    return [];
  }

  const transactionHistory = await prisma.fungibleAssetTransactionLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return transactionHistory;
};

interface IncrementFungibleAssetBalanceProps {
  asset: FungibleAsset;
  amount: number;
  transactionLogType: TransactionLogType;
  injectedPrisma?: PrismaTransactionClient | undefined;
  questionIds?: number[];
  deckIds?: number[];
}
export const incrementFungibleAssetBalance = async ({
  asset,
  amount,
  transactionLogType,
  injectedPrisma = prisma,
  questionIds,
  deckIds,
}: IncrementFungibleAssetBalanceProps) => {
  const payload = await getJwtPayload();
  const userId = payload?.sub ?? "";
  let transactionLogTask;
  if (!!questionIds?.length)
    transactionLogTask = injectedPrisma.fungibleAssetTransactionLog.createMany({
      data: questionIds.map((questionId) => ({
        asset: asset,
        type: transactionLogType,
        change: amount,
        userId: userId,
        questionId: questionId,
      })),
    });
  if (!!deckIds?.length)
    transactionLogTask = injectedPrisma.fungibleAssetTransactionLog.createMany({
      data: deckIds.map((deckId) => ({
        asset: asset,
        type: transactionLogType,
        change: amount,
        userId: userId,
        deckId: deckId,
      })),
    });
  const result = await Promise.all([transactionLogTask]);
  return result[0];
};

// charge user credits for premium decks/questions
export const chargeUserCredits = async (questionId: number) => {
  const payload = await authGuard();

  const creditForQuestion = await prisma.deck.findMany({
    where: {
      deckQuestions: {
        some: {
          questionId,
        },
      },
    },
    select: {
      creditCostPerQuestion: true,
    },
  });

  if (creditForQuestion.length > 1) {
    const questionDeckConflict = new QuestionMultiDecksError(
      `Question with id ${questionId} is associated with ${creditForQuestion.length}  decks`,
    );
    Sentry.captureException(questionDeckConflict, {
      extra: {
        questionId,
        creditForQuestion,
      },
    });
  }

  const creditCostPerQuestion = creditForQuestion[0]?.creditCostPerQuestion;

  if (creditCostPerQuestion === null) return;

  await prisma.fungibleAssetTransactionLog.create({
    data: {
      type: TransactionLogType.PremiumQuestionCharge,
      questionId: questionId,
      asset: FungibleAsset.Credit,
      change: -Math.abs(creditCostPerQuestion),
      userId: payload.sub,
    },
  });
};

export const addXPoints = async () => {
  const payload = await authGuard();

  const xPointsEarned = await prisma.fungibleAssetTransactionLog.findMany({
    where: {
      type: TransactionLogType.ConnectX,
      userId: payload.sub,
    },
  });

  if (!!xPointsEarned.length) return;

  await prisma.fungibleAssetTransactionLog.create({
    data: {
      type: TransactionLogType.ConnectX,
      asset: FungibleAsset.Point,
      change: pointsPerAction.ConnectX,
      userId: payload.sub,
    },
  });

  revalidatePath("/application");
};

export const addTelegramPoints = async () => {
  const payload = await authGuard();

  const telegramPointsEarned =
    await prisma.fungibleAssetTransactionLog.findMany({
      where: {
        type: TransactionLogType.ConnectTelegram,
        userId: payload.sub,
      },
    });

  if (!!telegramPointsEarned.length) return;

  await prisma.fungibleAssetTransactionLog.create({
    data: {
      type: TransactionLogType.ConnectTelegram,
      asset: FungibleAsset.Point,
      change: pointsPerAction.ConnectTelegram,
      userId: payload.sub,
    },
  });

  revalidatePath("/application");
};
