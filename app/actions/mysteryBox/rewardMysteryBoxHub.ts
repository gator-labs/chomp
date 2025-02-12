"use server";

import { getValidationRewardQuestions } from "@/app/queries/getValidationRewardQuestion";
import prisma from "@/app/services/prisma";
import { calculateMysteryBoxHubReward } from "@/app/utils/algo";
import { EMysteryBoxCategory } from "@/types/mysteryBox";
import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EBoxTriggerType,
  EPrizeSize,
} from "@prisma/client";

import { getJwtPayload } from "../jwt";

/**
 * Function to reward mystery box hub based on validation reward questions.
 * @param {EMysteryBoxCategory} type - The type of mystery box category.
 * @returns {Promise<Array<string> | null>} - Returns an array of mystery box IDs or null.
 */
export const rewardMysteryBoxHub = async ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type,
}: {
  type: EMysteryBoxCategory;
}): Promise<Array<string> | null> => {
  const payload = await getJwtPayload();
  if (!payload) {
    return null;
  }

  const userId = payload.sub;

  const userWallet = await prisma.wallet.findFirst({ where: { userId } });

  if (!userWallet) return null;

  const revealableQuestions = await getValidationRewardQuestions();

  if (!revealableQuestions?.length) {
    throw new Error("No revealable questions found");
  }

  const questionIds = revealableQuestions.map((rq) => rq.id);

  const existingTriggers = await prisma.mysteryBoxTrigger.findMany({
    where: {
      questionId: { in: questionIds },
      triggerType: EBoxTriggerType.ValidationReward,
      MysteryBoxPrize: {
        some: { status: EBoxPrizeStatus.Unclaimed },
      },
    },
  });

  const existingQuestionIds = existingTriggers.map(
    (trigger) => trigger.questionId,
  );
  const existingMysteryBoxIds = Array.from(
    new Set(existingTriggers.map((trigger) => trigger.mysteryBoxId)),
  );

  const newQuestionIds = questionIds.filter(
    (id) => !existingQuestionIds.includes(id),
  );

  if (newQuestionIds.length === 0) {
    return existingMysteryBoxIds;
  }

  const rewards = await calculateMysteryBoxHubReward(userId, newQuestionIds);
  if (rewards?.length !== newQuestionIds.length) {
    return null;
  }

  const tokenAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

  const getPrizePerTrigger = (reward: {
    questionId: number;
    creditRewardAmount: number;
    bonkRewardAmount: number;
  }) => {
    return [
      {
        prizeType: EBoxPrizeType.Credits,
        size: EPrizeSize.Hub,
        amount: reward.creditRewardAmount.toString(),
      },
      {
        prizeType: EBoxPrizeType.Token,
        amount: reward.bonkRewardAmount.toString(),
        size: EPrizeSize.Hub,
        tokenAddress: tokenAddress, // Add the bonk address here
      },
    ];
  };

  const newMysteryBoxId = await prisma.$transaction(async (tx) => {
    const mb = await tx.mysteryBox.create({
      data: {
        userId: userId,
      },
    });

    for (const reward of rewards) {
      await tx.mysteryBoxTrigger.create({
        data: {
          questionId: reward.questionId,
          triggerType: EBoxTriggerType.ValidationReward,
          mysteryBoxId: mb.id,
          MysteryBoxPrize: {
            createMany: { data: getPrizePerTrigger(reward) },
          },
        },
      });
    }
    return mb.id;
  });

  return [...existingMysteryBoxIds, newMysteryBoxId];
};
