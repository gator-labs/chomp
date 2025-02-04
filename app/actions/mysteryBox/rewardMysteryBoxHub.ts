"use server";

import { getValidationRewardQuestions } from "@/app/queries/getValidationRewardQuestion";
import prisma from "@/app/services/prisma";
import { calculateMysteryBoxHubReward } from "@/app/utils/algo";
import { EMysteryBoxCategory } from "@/types/mysteryBox";
import { EBoxPrizeType, EBoxTriggerType, EPrizeSize } from "@prisma/client";

import { getJwtPayload } from "../jwt";

export const rewardMysteryBoxHub = async ({}: {
  type: EMysteryBoxCategory;
}) => {
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
    },
  });

  const existingQuestionIds = existingTriggers.map(
    (trigger) => trigger.questionId,
  );
  const existingMysteryBoxIds = existingTriggers.map(
    (trigger) => trigger.mysteryBoxId,
  );

  const newQuestionIds = questionIds.filter(
    (id) => !existingQuestionIds.includes(id),
  );
  if (newQuestionIds.length > 0) {
    const rewards = await calculateMysteryBoxHubReward(userId, questionIds);
    if (rewards?.length !== newQuestionIds.length) {
      return null;
    }

    const tokenAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

    const prizes = rewards.flatMap((item) => [
      {
        prizeType: EBoxPrizeType.Credits,
        size: EPrizeSize.Hub,
        amount: item.creditRewardAmount.toString(),
      },
      {
        prizeType: EBoxPrizeType.Token,
        amount: item.bonkRewardAmount.toString(),
        size: EPrizeSize.Hub,
        tokenAddress: tokenAddress, // Add the bonk address here
      },
    ]);

    const res = await prisma.mysteryBox.create({
      data: {
        userId,
        triggers: {
          createMany: {
            data: newQuestionIds.map((questionId) => ({
              questionId: questionId,
              triggerType: EBoxTriggerType.ValidationReward,
              mysteryBoxAllowlistId: null,
            })),
          },
        },
        MysteryBoxPrize: {
          createMany: { data: prizes },
        },
      },
    });

    const newMysteryBoxId = res.id;
    return [...existingMysteryBoxIds, newMysteryBoxId];
  }

  return existingMysteryBoxIds;
};
