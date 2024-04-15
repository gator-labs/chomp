"use server";

import { FungibleAsset } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { pointsPerAction } from "../constants/points";
import { answerPercentageQuery } from "../queries/answerPercentageQuery";
import prisma from "../services/prisma";
import { isBinaryQuestionCorrectAnswer } from "../utils/question";
import { incrementFungibleAssetBalance } from "./fungible-asset";
import { getJwtPayload } from "./jwt";

export async function revealDeck(deckId: number) {
  const decks = await revealDecks([deckId]);
  return decks ? decks[0] : null;
}

export async function revealQuestion(questionId: number) {
  const questions = await revealQuestions([questionId]);
  return questions ? questions[0] : null;
}

export async function revealDecks(deckIds: number[]) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  await prisma.$transaction(async (tx) => {
    await tx.reveal.createMany({
      data: deckIds.map((deckId) => ({
        deckId,
        userId: payload.sub,
      })),
    });

    await incrementFungibleAssetBalance(
      FungibleAsset.Point,
      await calculateRevealPoints(payload.sub, deckIds, !!"isDeck"),
      tx,
    );
  });

  revalidatePath("/application");
}

export async function revealQuestions(questionIds: number[]) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  await prisma.$transaction(async (tx) => {
    await tx.reveal.createMany({
      data: questionIds.map((questionId) => ({
        questionId,
        userId: payload.sub,
      })),
    });

    await incrementFungibleAssetBalance(
      FungibleAsset.Point,
      await calculateRevealPoints(payload.sub, questionIds),
      tx,
    );
  });

  revalidatePath("/application");
}

const calculateRevealPoints = async (
  userId: string,
  ids: number[],
  isDeck?: boolean,
) => {
  const questions = await prisma.deckQuestion.findMany({
    where: isDeck
      ? {
          deckId: { in: ids },
        }
      : {
          questionId: { in: ids },
        },
    include: {
      question: {
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
      },
    },
  });

  const questionOptionPercentages = await answerPercentageQuery(
    questions.flatMap((q) => q.question.questionOptions).map((qo) => qo.id),
  );

  const correctFirstOrderQuestions = questions.filter(({ question }) => {
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

  const correctSecondOrderQuestions = questions.filter(({ question }) => {
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
