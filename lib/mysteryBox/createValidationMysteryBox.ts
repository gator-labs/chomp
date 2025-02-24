import { getValidationRewardQuestions } from "@/app/queries/getValidationRewardQuestion";
import prisma from "@/app/services/prisma";
import { calculateMysteryBoxHubReward } from "@/app/utils/algo";
import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EBoxTriggerType,
  EMysteryBoxStatus,
  EPrizeSize,
} from "@prisma/client";
import "server-only";

import { getBonkAddress } from "../env-vars";

export const createValidationMysteryBox = async (userId: string) => {
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
      MysteryBox: {
        status: { in: [EMysteryBoxStatus.New, EMysteryBoxStatus.Unopened] },
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

  const tokenAddress = getBonkAddress();

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
