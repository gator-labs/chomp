import { TransactionLogType } from "@prisma/client";

import { pointsPerAction } from "../constants/points";

type RevealPointResult = {
  amount: number;
  type: TransactionLogType;
  questionId: number;
};

export const calculateRevealPoints = async (
  rewards: { questionId: number; rewardAmount: number; revealAmount: number }[],
): Promise<RevealPointResult[]> => {
  const revealPoints = [];

  for (const reward of rewards) {
    revealPoints.push({
      questionId: reward.questionId,
      amount: pointsPerAction[TransactionLogType.RevealAnswer],
      type: TransactionLogType.RevealAnswer,
    });

    if (reward.rewardAmount >= reward.revealAmount) {
      revealPoints.push({
        questionId: reward.questionId,
        amount: pointsPerAction[TransactionLogType.CorrectFirstOrder],
        type: TransactionLogType.CorrectFirstOrder,
      });
    }

    if (reward.rewardAmount > reward.revealAmount) {
      revealPoints.push({
        questionId: reward.questionId,
        amount: pointsPerAction[TransactionLogType.CorrectSecondOrder],
        type: TransactionLogType.CorrectSecondOrder,
      });
    }
  }

  return revealPoints;
};
