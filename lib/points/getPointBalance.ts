import prisma from "@/app/services/prisma";
import { FungibleAsset } from "@prisma/client";
import "server-only";

export async function getPointBalance(userId: string) {
  const res = await prisma.userBalance.findUnique({
    where: {
      userId_asset: {
        asset: FungibleAsset.Point,
        userId,
      },
    },
  });

  return res?.balance.toNumber() ?? 0;
}
