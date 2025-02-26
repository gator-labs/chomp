import prisma from "@/app/services/prisma";
import { calculateMysteryBoxReward } from "@/app/utils/algo";
import { MysteryBoxEventsType } from "@/types/mysteryBox";
import {
  EBoxPrizeType,
  EBoxTriggerType,
  EMysteryBoxStatus,
  EPrizeSize,
} from "@prisma/client";
import "server-only";

import { getBonkAddress } from "../env-vars";

/**
 * @description Validate campaign details. Create new mystery box if doesn't exist else return the existing mb id for new and unclaimed box.
 * @param {string} userId - The unique identifier of the user
 * @param {string} [campaignBoxId] - Optional. The identifier of the campaign box
 * @returns {Promise<string[]>} A promise that resolves to an array of string IDs representing mystery box identifiers
 */

export const createCampaignMysteryBox = async (
  userId: string,
  campaignBoxId?: string,
) => {
  const userWallet = await prisma.wallet.findFirst({ where: { userId } });

  if (!userWallet) return null;

  if (!campaignBoxId) {
    throw new Error("Campaign doesn't exist");
  }
  const validCampaign = await prisma.campaignMysteryBoxAllowlist.findFirst({
    where: {
      campaignMysteryBoxId: campaignBoxId,
      address: userWallet.address,
    },
  });

  if (!validCampaign) {
    throw new Error("User is not eligible for reward");
  }

  // TODO: Switch to actual mechanism engine endpoint when ready.
  const calculatedReward = await calculateMysteryBoxReward(
    MysteryBoxEventsType.CHOMPMAS,
  );

  const tokenAddress = getBonkAddress();

  let mysteryBoxId;

  await prisma.$transaction(async (tx) => {
    const existingBox = await tx.mysteryBoxTrigger.findFirst({
      where: {
        campaignMysteryBoxId: campaignBoxId,
      },
      include: {
        MysteryBox: {
          where: {
            status: { in: [EMysteryBoxStatus.New, EMysteryBoxStatus.Unopened] },
          },
        },
      },
    });
    if (existingBox) {
      mysteryBoxId = existingBox.MysteryBox?.id;
    } else {
      // First, create the mysteryBox
      const newMysteryBox = await tx.mysteryBox.create({
        data: {
          userId: userId,
        },
      });

      // Then, create the associated trigger
      await tx.mysteryBoxTrigger.create({
        data: {
          triggerType: EBoxTriggerType.CampaignReward,
          mysteryBoxAllowlistId: userWallet.address,
          mysteryBoxId: newMysteryBox.id,
          campaignMysteryBoxId: campaignBoxId,
          MysteryBoxPrize: {
            createMany: {
              data: [
                {
                  prizeType: EBoxPrizeType.Credits,
                  size: EPrizeSize.Hub,
                  amount: calculatedReward.credits.toString(),
                },
                {
                  prizeType: EBoxPrizeType.Token,
                  amount: calculatedReward.bonk.toString(),
                  size: EPrizeSize.Hub,
                  tokenAddress: tokenAddress,
                },
              ],
            },
          },
        },
      });

      mysteryBoxId = newMysteryBox.id;
    }
  });

  if (!mysteryBoxId) {
    throw new Error("Error failed to get a mystery box id");
  }

  return [mysteryBoxId];
};
