import { getValidationRewardQuestions } from "@/app/queries/getValidationRewardQuestion";
import prisma from "@/app/services/prisma";
import { calculateMysteryBoxHubReward } from "@/app/utils/algo";
import { ONE_MINUTE_IN_MILLISECONDS } from "@/app/utils/dateUtils";
import {
  EBoxPrizeStatus,
  EBoxTriggerType,
  EMysteryBoxStatus,
} from "@prisma/client";
import "server-only";

import { getPrizePerTrigger } from "./getPrizePerTrigger";

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
        userId: userId,
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

  const totalBonkReward = rewards.reduce((total, reward) => total + reward.creditRewardAmount, 0);

  const newMysteryBoxId = await prisma.$transaction(
    async (tx) => {
      const mb = await tx.mysteryBox.create({
        data: {
          userId: userId,
        },
      });

      const treasury = await tx.bonkTreasury.findUnique({ where: { id: 'treasury' } });
      const treasuryBalance = Number(treasury?.balance ?? 0);

      if (treasuryBalance < totalBonkReward)
        throw new Error('Insufficient treasury funds');

      await tx.bonkTreasury.update({
        where: { id: 'treasury' },
        data: { balance: String(treasuryBalance - totalBonkReward) }
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
    },
    {
      timeout: ONE_MINUTE_IN_MILLISECONDS,
    },
  );

  return [...existingMysteryBoxIds, newMysteryBoxId];
};
