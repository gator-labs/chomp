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

  try {
    const questionOptions = await prisma.questionOption.findMany({
      where: { questionId },
      include: {
        question: true,
      },
      orderBy: { index: "asc" },
    });

    const question = questionOptions?.[0]?.question;

    if (!question) {
      throw new Error("Question not found");
    }

    const existingAnswers = await prisma.questionAnswer.findMany({
      where: {
        userId,
        questionOption: {
          questionId,
        },
      },
      orderBy: {
        questionOption: {
          index: "asc",
        },
      },
    });

    if (existingAnswers.length) {
      const assigned2ndOrderIndex = existingAnswers.findIndex(
        (a) => !!a.isAssigned2ndOrderOption,
      );

      return {
        random: assigned2ndOrderIndex > 0 ? assigned2ndOrderIndex : 0,
      };
    }

    const numOptions =
      questionOptions.length > 0 ? questionOptions.length - 1 : 0;

    const random = getRandomInteger(0, numOptions);

    const answerData = questionOptions.map((qo, index) => ({
      questionOptionId: qo.id,
      userId,
      status: AnswerStatus.Viewed,
      isAssigned2ndOrderOption:
        index === random && question.type === QuestionType.MultiChoice,
      selected: false,
    }));
    await prisma.questionAnswer.createMany({
      data: answerData,
    });
    return {
      random: question.type === QuestionType.MultiChoice ? random : 0,
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
