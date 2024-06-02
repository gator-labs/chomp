import { TransactionLogType } from "@prisma/client";
import { pointsPerAction } from "../constants/points";
import { answerPercentageQuery } from "../queries/answerPercentageQuery";
import prisma from "../services/prisma";
import { isBinaryQuestionCorrectAnswer } from "./question";

type RevealPointResult = {
  amount: number;
  type: TransactionLogType;
};

export const calculateRevealPoints = async (
  userId: string,
  questionIds: number[],
): Promise<RevealPointResult[]> => {
  const questions = await prisma.question.findMany({
    where: {
      id: {
        in: questionIds,
      },
    },
    include: {
      questionOptions: {
        include: {
          questionAnswers: {
            where: {
              userId,
              hasViewedButNotSubmitted: false,
            },
          },
        },
      },
    },
  });

  const questionOptionPercentages = await answerPercentageQuery(
    questions.flatMap((q) => q.questionOptions.map((qo) => qo.id)),
  );

  const correctFirstOrderQuestions = questions.filter((question) => {
    const answers = question.questionOptions.flatMap(
      (qo) => qo.questionAnswers,
    );

    if (answers.length === 2) {
      if (answers[0].percentage === null || answers[1].percentage === null) {
        return false;
      }

      const aCalculatedPercentage = questionOptionPercentages.find(
        (questionOption) => questionOption.id === answers[0].questionOptionId,
      )?.percentageResult;

      const bCalculatedPercentage = questionOptionPercentages.find(
        (questionOption) => questionOption.id === answers[1].questionOptionId,
      )?.percentageResult;

      if (
        aCalculatedPercentage === undefined ||
        bCalculatedPercentage === undefined
      ) {
        return false;
      }

      return isBinaryQuestionCorrectAnswer(
        {
          optionId: answers[0].questionOptionId,
          calculatedPercentage: aCalculatedPercentage,
          selectedPercentage: answers[0].percentage,
          selected: answers[0].selected,
        },
        {
          optionId: answers[1].questionOptionId,
          calculatedPercentage: bCalculatedPercentage,
          selectedPercentage: answers[1].percentage,
          selected: answers[1].selected,
        },
      );
    }

    // TODO: multi choice questions algo when ready

    return false;
  });

  const correctSecondOrderQuestions = questions.filter((question) => {
    const selectedAnswers = question.questionOptions
      .flatMap((qo) => qo.questionAnswers)
      .filter((qa) => qa.selected);

    if (!selectedAnswers.length) {
      return false;
    }

    return !!questionOptionPercentages.find(
      (questionOption) =>
        questionOption.id === selectedAnswers[0].questionOptionId &&
        questionOption.percentageResult === selectedAnswers[0].percentage,
    );
  });

  return [
    {
      amount:
        questions.length * pointsPerAction[TransactionLogType.RevealAnswer],
      type: TransactionLogType.RevealAnswer,
    },
    {
      amount:
        correctFirstOrderQuestions.length *
        pointsPerAction[TransactionLogType.CorrectFirstOrder],
      type: TransactionLogType.CorrectFirstOrder,
    },
    {
      amount:
        correctSecondOrderQuestions.length *
        pointsPerAction[TransactionLogType.CorrectSecondOrder],
      type: TransactionLogType.CorrectSecondOrder,
    },
  ].filter((item) => item.amount > 0);
};
