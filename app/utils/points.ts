import { QuestionType, TransactionLogType } from "@prisma/client";
import { pointsPerAction } from "../constants/points";
import prisma from "../services/prisma";

type RevealPointResult = {
  amount: number;
  type: TransactionLogType;
};

export const calculateRevealPoints = async (
  userId: string,
  questionIds: number[],
): Promise<RevealPointResult[]> => {
  const answers = await prisma.questionAnswer.findMany({
    where: {
      questionOption: {
        questionId: {
          in: questionIds,
        },
      },
      userId,
      hasViewedButNotSubmitted: false,
    },
    include: {
      questionOption: {
        include: {
          question: true,
        },
      },
    },
  });

  const correctFirstOrder = answers.filter(
    (answer) => answer.selected && answer.questionOption.calculatedIsCorrect,
  );

  const correctSecondOrder = answers.filter((answer) => {
    if (answer.questionOption.question.type === QuestionType.BinaryQuestion) {
      return (
        answer.questionOption.isLeft &&
        answer.percentage ===
          answer.questionOption.calculatedPercentageOfSelectedAnswers
      );
    }

    if (answer.questionOption.question.type === QuestionType.MultiChoice) {
      return (
        answer.percentage !== null &&
        answer.percentage ===
          answer.questionOption.calculatedPercentageOfSelectedAnswers
      );
    }

    return false;
  });

  return [
    {
      amount:
        questionIds.length * pointsPerAction[TransactionLogType.RevealAnswer],
      type: TransactionLogType.RevealAnswer,
    },
    {
      amount:
        correctFirstOrder.length *
        pointsPerAction[TransactionLogType.CorrectFirstOrder],
      type: TransactionLogType.CorrectFirstOrder,
    },
    {
      amount:
        correctSecondOrder.length *
        pointsPerAction[TransactionLogType.CorrectSecondOrder],
      type: TransactionLogType.CorrectSecondOrder,
    },
  ].filter((item) => item.amount > 0);
};
