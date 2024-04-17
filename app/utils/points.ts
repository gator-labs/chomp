import { pointsPerAction } from "../constants/points";
import { answerPercentageQuery } from "../queries/answerPercentageQuery";
import prisma from "../services/prisma";
import { isBinaryQuestionCorrectAnswer } from "./question";

export const calculateRevealPoints = async (
  userId: string,
  ids: number[],
  isDeck?: boolean,
) => {
  const questions = await prisma.question.findMany({
    where: isDeck
      ? {
          deckQuestions: {
            some: {
              deckId: {
                in: ids,
              },
            },
          },
        }
      : {
          id: {
            in: ids,
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
          calculatedPercentage: aCalculatedPercentage,
          selectedPercentage: answers[0].percentage,
          selected: answers[0].selected,
        },
        {
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

  return (
    questions.length * pointsPerAction["reveal-answer"] +
    correctFirstOrderQuestions.length * pointsPerAction["correct-first-order"] +
    correctSecondOrderQuestions.length * pointsPerAction["correct-second-order"]
  );
};
