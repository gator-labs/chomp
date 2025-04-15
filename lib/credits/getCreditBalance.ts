import prisma from "@/app/services/prisma";
import { FungibleAsset } from "@prisma/client";
import "server-only";

export async function getCreditBalance(userId: string) {
  const res = await prisma.fungibleAssetTransactionLog.aggregate({
    where: {
      asset: FungibleAsset.Credit,
      userId,
    },
    _sum: {
      change: true,
    },
  });

  if (!res?._sum?.change) return 0;

  return res._sum.change.toNumber();
}
