import {
  FungibleAsset,
  FungibleAssetBalance,
  TransactionLogType,
} from "@prisma/client";
import prisma, { PrismaTransactionClient } from "../services/prisma";
import { createTypedObjectFromEntries } from "../utils/object";
import { getJwtPayload } from "./jwt";

export const getMyFungibleAssetBalances = async (): Promise<
  Record<FungibleAsset, number>
> => {
  const payload = await getJwtPayload();
  const userId = payload?.sub ?? "";

  const balances = await prisma.fungibleAssetBalance.findMany({
    where: {
      userId,
    },
  });

  const fungibleAssets = Object.values(FungibleAsset);

  return createTypedObjectFromEntries(
    fungibleAssets.map((fungibleAsset) => {
      const balance = balances.find(
        (balance) => balance.asset === fungibleAsset,
      );
      return [fungibleAsset, balance ? balance.amount.toNumber() : 0];
    }),
  );
};

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
}: IncrementFungibleAssetBalanceProps): Promise<FungibleAssetBalance> => {
  const payload = await getJwtPayload();
  const userId = payload?.sub ?? "";

  const upsertTask = injectedPrisma.fungibleAssetBalance.upsert({
    where: {
      asset_userId: {
        asset,
        userId,
      },
    },
    update: {
      amount: {
        increment: amount,
      },
    },
    create: {
      userId,
      asset,
      amount,
    },
  });

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

  const result = await Promise.all([upsertTask, transactionLogTask]);

  return result[0];
};
