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
  });

  return transactionHistory;
};

export const incrementFungibleAssetBalance = async (
  asset: FungibleAsset,
  amount: number,
  transactionLogType: TransactionLogType,
  injectedPrisma: PrismaTransactionClient | undefined = prisma,
  campaignId?: number | null,
): Promise<FungibleAssetBalance> => {
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

  const transactionLogTask = injectedPrisma.fungibleAssetTransactionLog.create({
    data: {
      asset: asset,
      type: transactionLogType,
      change: amount,
      userId: userId,
    },
  });

  let dailyLeaderboardTask;

  if (!!campaignId) {
    const currentDate = new Date();

    dailyLeaderboardTask = await injectedPrisma.dailyLeaderboard.upsert({
      where: {
        user_campaign_date: {
          userId,
          campaignId,
          date: currentDate,
        },
      },
      create: {
        userId,
        campaignId,
        points: amount,
      },
      update: {
        points: { increment: amount },
      },
    });
  }

  const result = await Promise.all([
    upsertTask,
    transactionLogTask,
    dailyLeaderboardTask,
  ]);

  return result[0];
};
