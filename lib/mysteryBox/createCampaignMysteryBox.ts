import prisma from "@/app/services/prisma";
import { calculateMysteryBoxReward } from "@/app/utils/algo";
import { MAX_DECIMALS } from "@/constants/tokens";
import {
  EBoxPrizeType,
  EBoxTriggerType,
  EMysteryBoxStatus,
  EPrizeSize,
} from "@prisma/client";
import Decimal from "decimal.js";
import "server-only";

import { getBonkAddress } from "../env-vars";

/**
 * Validate campaign details.
 * Create new mystery box if doesn't exist else return the existing mb id for new and unclaimed box.
 */
export const createCampaignMysteryBox = async (
  userId: string,
  campaignBoxId?: string,
): Promise<string[] | null> => {
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
    include: {
      campaignMysteryBox: true,
    },
  });

  if (!validCampaign) {
    throw new Error("User is not eligible for reward");
  }

  const calculatedReward = await calculateMysteryBoxReward(
    validCampaign.campaignMysteryBox.boxType,
  );

  const tokenAddress = getBonkAddress();

  let mysteryBoxId;

  await prisma.$transaction(async (tx) => {
    const existingBox = await tx.mysteryBoxTrigger.findFirst({
      where: {
        campaignMysteryBoxId: campaignBoxId,
        MysteryBox: {
          userId: userId,
        },
      },
      include: {
        MysteryBox: {
          where: {
            status: { in: [EMysteryBoxStatus.New, EMysteryBoxStatus.Unopened] },
            userId: userId,
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
                  amount: new Decimal(calculatedReward.bonk)
                    .toDP(MAX_DECIMALS.BONK, Decimal.ROUND_DOWN)
                    .toString(),
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
