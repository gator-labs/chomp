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
 * @param {string} address - The wallet address of the user
 * @param {string} userId - The unique identifier of the user
 * @param {string} [campaignBoxId] - Optional. The identifier of the campaign box
 * @returns {Promise<string[]>} A promise that resolves to an array of string IDs representing mystery box identifiers
 */

export const createCampaignMysteryBox = async (
  address: string,
  userId: string,
  campaignBoxId?: string,
) => {
  if (!campaignBoxId) {
    throw new Error("Campaign doesn't exist");
  }
  const validCampaign = await prisma.campaignMysteryBoxAllowed.findFirst({
    where: {
      campaignMysteryBoxId: campaignBoxId,
      allowlistAddress: address,
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
      mysteryBoxId = existingBox.id;
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
          mysteryBoxAllowlistId: address,
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
