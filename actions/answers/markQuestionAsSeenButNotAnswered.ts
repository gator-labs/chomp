"use server";

import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { getRandomInteger } from "@/app/utils/randomUtils";
import { AnswerStatus, QuestionType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

export async function markQuestionAsSeenButNotAnswered(questionId: number) {
  const payload = await getJwtPayload();

  if (!payload) return;

  const userId = payload.sub;
  const questionOptions = await prisma.questionOption.findMany({
    where: { questionId },
    include: {
      question: true,
    },
  });

  try {
    const numOptions =
      questionOptions.length > 0 ? questionOptions.length - 1 : 0;

    const random = getRandomInteger(0, numOptions);

    const answerData = questionOptions.map((qo, index) => ({
      questionOptionId: qo.id,
      userId,
      status: AnswerStatus.Viewed,
      isAssigned2ndOrderOption:
        index === random &&
        questionOptions[0].question.type === QuestionType.MultiChoice,
      selected: false,
    }));
    await prisma.questionAnswer.createMany({
      data: answerData,
    });
    return {
      random:
        questionOptions[0].question.type === QuestionType.MultiChoice
          ? random
          : 0,
    };
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        userId,
      },
    });

    console.error("Error in markQuestionAsSeenButNotAnswered", error);
    return { hasError: true };
  }
}
