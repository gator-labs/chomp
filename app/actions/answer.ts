"use server";

import { revalidatePath } from "next/cache";
import prisma from "../services/prisma";
import { getJwtPayload } from "./jwt";
import { FungibleAsset, QuestionAnswer, QuestionType } from "@prisma/client";
import { incrementFungibleAssetBalance } from "./fungible-asset";
import { pointsPerAction } from "../constants/points";

export type SaveQuestionRequest = {
  questionId: number;
  questionOptionId?: number;
  percentageGiven?: number;
  percentageGivenForAnswerId?: number;
};

export async function saveDeck(request: SaveQuestionRequest[], deckId: number) {
  const payload = await getJwtPayload();
  const userId = payload?.sub ?? "";
  const questionIds = request
    .filter((dr) => dr.percentageGiven !== undefined && !!dr.questionOptionId)
    .map((dr) => dr.questionId);

  const questionOptions = await prisma.questionOption.findMany({
    where: { questionId: { in: questionIds } },
    include: { question: true },
  });

  const questionAnswers = questionOptions.map((qo) => {
    const answerForQuestion = request.find(
      (r) => r.questionId === qo.questionId
    );
    const isOptionSelected = qo.id === answerForQuestion?.questionOptionId;

    if (
      qo.question.type === QuestionType.TrueFalse ||
      qo.question.type === QuestionType.YesNo
    ) {
      const isYesOrTrueOption = qo.option === "Yes" || qo.option === "True";
      return {
        percentage: isYesOrTrueOption
          ? answerForQuestion?.percentageGiven
          : 100 - (answerForQuestion?.percentageGiven ?? 0),
        questionOptionId: qo.id,
        selected: isOptionSelected,
        userId,
      } as QuestionAnswer;
    }

    const percentageForQuestionOption =
      answerForQuestion?.percentageGivenForAnswerId === qo.id
        ? answerForQuestion.percentageGiven
        : undefined;

    return {
      selected: isOptionSelected,
      percentage: percentageForQuestionOption,
      questionOptionId: qo.id,
      userId,
    } as QuestionAnswer;
  });

  await prisma.$transaction(async (tx) => {
    await tx.userDeck.create({
      data: {
        deckId: deckId,
        userId: payload?.sub ?? "",
      },
    });

    await tx.questionAnswer.createMany({
      data: questionAnswers,
    });

    await incrementFungibleAssetBalance(
      FungibleAsset.Point,
      questionIds.length * pointsPerAction["answer-question"] +
        pointsPerAction["answer-deck"],
      tx
    );
  });

  revalidatePath("/application");
}

export async function saveQuestion(request: SaveQuestionRequest) {
  const payload = await getJwtPayload();
  const userId = payload?.sub ?? "";

  if (request.percentageGiven === undefined || !request.questionOptionId) {
    return;
  }

  const questionOptions = await prisma.questionOption.findMany({
    where: { questionId: request.questionId },
    include: { question: true },
  });

  const questionAnswers = questionOptions.map((qo) => {
    const isOptionSelected = qo.id === request?.questionOptionId;

    if (
      qo.question.type === QuestionType.TrueFalse ||
      qo.question.type === QuestionType.YesNo
    ) {
      const isYesOrTrueOption = qo.option === "Yes" || qo.option === "True";
      return {
        percentage: isYesOrTrueOption
          ? request?.percentageGiven
          : 100 - (request?.percentageGiven ?? 0),
        questionOptionId: qo.id,
        selected: isOptionSelected,
        userId,
      } as QuestionAnswer;
    }

    const percentageForQuestionOption =
      request?.percentageGivenForAnswerId === qo.id
        ? request.percentageGiven
        : undefined;

    return {
      selected: isOptionSelected,
      percentage: percentageForQuestionOption,
      questionOptionId: qo.id,
      userId,
    } as QuestionAnswer;
  });

  await prisma.$transaction(async (tx) => {
    await tx.questionAnswer.createMany({
      data: questionAnswers,
    });

    await incrementFungibleAssetBalance(
      FungibleAsset.Point,
      pointsPerAction["answer-question"],
      tx
    );
  });

  revalidatePath("/application");
}
