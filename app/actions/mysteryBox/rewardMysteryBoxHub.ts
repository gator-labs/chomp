"use server";

import prisma from "@/app/services/prisma";
import { createCampaignMysteryBox } from "@/lib/mysteryBox/createCampaignMysteryBox";
import { createValidationMysteryBox } from "@/lib/mysteryBox/createValidationMysteryBox";
import { EMysteryBoxCategory } from "@/types/mysteryBox";

import { getJwtPayload } from "../jwt";

/**
 * Function to reward mystery box hub based on validation reward questions.
 * @param {EMysteryBoxCategory} type - The type of mystery box category.
 * @param campaignBoxId -- optional campaign id if user is opening a campaign box
 * @returns Returns an array of mystery box IDs or null.
 */
export const rewardMysteryBoxHub = async ({
  type,
  campaignBoxId,
}: {
  type: EMysteryBoxCategory;
  campaignBoxId?: string;
}) => {
  const payload = await getJwtPayload();
  if (!payload) {
    return null;
  }

  const userId = payload.sub;

  const userWallet = await prisma.wallet.findFirst({ where: { userId } });

  if (!userWallet) return null;

  if (type === EMysteryBoxCategory.Validation) {
    return await createValidationMysteryBox(userId);
  } else if (type === EMysteryBoxCategory.Campaign) {
    return await createCampaignMysteryBox(
      userWallet.address,
      userId,
      campaignBoxId,
    );
  } else {
    return [];
  }
};
