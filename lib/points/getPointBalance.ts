import prisma from "@/app/services/prisma";
import { FungibleAsset } from "@prisma/client";
import "server-only";

export async function getPointBalance(userId: string) {
  const res = await prisma.fungibleAssetTransactionLog.aggregate({
    where: {
      asset: FungibleAsset.Point,
      userId,
    },
    _sum: {
      change: true,
    },
  });

  if (!res?._sum?.change) return 0;

  return res._sum.change.toNumber();
}
