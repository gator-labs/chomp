import prisma from "@/app/services/prisma";
import { FungibleAsset } from "@prisma/client";
import "server-only";

export async function getCreditBalance(userId: string) {
  const res = await prisma.userBalance.findUnique({
    where: {
      userId_asset: {
        asset: FungibleAsset.Credit,
        userId,
      },
    },
  });

  return res?.balance.toNumber() ?? 0;
}
