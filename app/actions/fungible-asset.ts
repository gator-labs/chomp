import { FungibleAsset } from "@prisma/client";
import prisma from "../services/prisma";
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
