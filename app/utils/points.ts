import { TransactionLogType } from "@prisma/client";
import { pointsPerAction } from "../constants/points";

type RevealPointResult = {
  amount: number;
  type: TransactionLogType;
};

export const calculateRevealPoints = async (
  rewards: number[],
): Promise<RevealPointResult[]> => {
  return [
    {
      amount: rewards.length * pointsPerAction[TransactionLogType.RevealAnswer],
      type: TransactionLogType.RevealAnswer,
    },
    {
      amount:
        rewards.filter((reward) => reward >= 5000).length *
        pointsPerAction[TransactionLogType.CorrectFirstOrder],
      type: TransactionLogType.CorrectFirstOrder,
    },
    {
      amount:
        rewards.filter((reward) => reward > 5000).length *
        pointsPerAction[TransactionLogType.CorrectSecondOrder],
      type: TransactionLogType.CorrectSecondOrder,
    },
  ].filter((item) => item.amount > 0);
};
