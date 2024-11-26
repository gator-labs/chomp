"use server";

import { FungibleAsset, TransactionLogType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { pointsPerAction } from "../constants/points";
import prisma from "../services/prisma";
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
