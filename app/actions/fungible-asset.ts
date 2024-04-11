import {
  FungibleAsset,
  FungibleAssetBalance,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import prisma, { PrismaTransactionClient } from "../services/prisma";
import { getJwtPayload } from "./jwt";
import { createTypedObjectFromEntries } from "../utils/object";

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
        (balance) => balance.asset === fungibleAsset
      );
      return [fungibleAsset, balance ? balance.amount.toNumber() : 0];
    })
  );
};

export const incrementFungibleAssetBalance = async (
  asset: FungibleAsset,
  amount: number,
  injectedPrisma: PrismaTransactionClient = prisma
): Promise<FungibleAssetBalance> => {
  const payload = await getJwtPayload();
  const userId = payload?.sub ?? "";

  return await injectedPrisma.fungibleAssetBalance.upsert({
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
};
