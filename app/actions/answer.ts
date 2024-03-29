"use server";
import prisma from "../services/prisma";
import { getJwtPayload } from "./jwt";
import { QuestionAnswer, QuestionType } from "@prisma/client";

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

  prisma.$transaction(async (tx) => {
    await tx.userDeck.create({
      data: {
        deckId: deckId,
        userId: payload?.sub ?? "",
      },
    });

    await tx.questionAnswer.createMany({
      data: questionAnswers,
    });
  });
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

  await prisma.questionAnswer.createMany({
    data: questionAnswers,
  });
}
