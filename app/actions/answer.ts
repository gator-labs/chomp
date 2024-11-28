"use server";

import { AnswerStatus, QuestionAnswer, QuestionType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";
import { release } from "os";

import { AnswerError } from "../../lib/error";
import { addUserTutorialTimestamp } from "../queries/user";
import prisma from "../services/prisma";
import { getJwtPayload } from "./jwt";

export type SaveQuestionRequest = {
  questionId: number;
  questionOptionId?: number;
  percentageGiven?: number;
  percentageGivenForAnswerId?: number;
  timeToAnswerInMiliseconds?: number;
  deckId?: number;
};

export async function addTutorialPoints() {
  await addUserTutorialTimestamp();
  revalidatePath("/tutorial");
}

export async function answerQuestion(request: SaveQuestionRequest) {
  const payload = await getJwtPayload();
  const userId = payload?.sub ?? "";

  if (!userId) return;

  try {
    const questionOptions = await prisma.questionOption.findMany({
      where: {
        questionId: request.questionId,
        question: {
          revealAtDate: {
            gte: new Date(),
          },
        },
      },
      include: {
        question: true,
      },
    });

    if (!questionOptions.length) {
      throw new Error(`
      Question with id: ${request.questionId} does not exist or it is revealed and cannot be answered.`);
    }

    const questionAnswers = questionOptions.map((qo) => {
      const isOptionSelected = qo.id === request?.questionOptionId;

      const percentageForQuestionOption =
        request?.percentageGivenForAnswerId === qo.id
          ? request?.percentageGiven
          : undefined;

      const percentage =
        qo.question.type === QuestionType.BinaryQuestion &&
        !percentageForQuestionOption
          ? 100 - request!.percentageGiven!
          : percentageForQuestionOption;

      return {
        selected: isOptionSelected,
        percentage,
        questionOptionId: qo.id,
        timeToAnswer: request?.timeToAnswerInMiliseconds
          ? BigInt(request?.timeToAnswerInMiliseconds)
          : null,
        userId,
        status: AnswerStatus.Submitted,
      } as QuestionAnswer;
    });

    const userQuestionAnswers = await prisma.questionAnswer.findMany({
      where: {
        questionOption: {
          questionId: request.questionId,
        },
        userId,
      },
    });

    if (
      userQuestionAnswers.length &&
      userQuestionAnswers.some((qa) => qa.status === AnswerStatus.Submitted)
    ) {
      throw new Error(
        `User with id: ${payload?.sub} has already answered question with id: ${request.questionId}`,
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.questionAnswer.deleteMany({
        where: {
          questionOption: {
            questionId: request.questionId,
          },
          userId,
        },
      });

      await tx.questionAnswer.createMany({
        data: questionAnswers,
      });
    });
  } catch (error) {
    const answerError = new AnswerError(
      `User with id: ${payload?.sub} is having trouble answering question with id: ${request.questionId}`,
      { cause: error },
    );
    Sentry.captureException(answerError);
    release();
    throw error;
  }
}

export async function markQuestionAsSeenButNotAnswered(questionId: number) {
  const payload = await getJwtPayload();

  if (!payload) return;

  const userId = payload.sub;

  const questionOptions = await prisma.questionOption.findMany({
    where: { questionId },
  });

  try {
    await prisma.questionAnswer.createMany({
      data: questionOptions.map((qo) => ({
        questionOptionId: qo.id,
        userId,
        status: AnswerStatus.Viewed,
        selected: false,
      })),
    });
  } catch {
    return { hasError: true };
  }
}

export async function markQuestionAsTimedOut(questionId: number) {
  const payload = await getJwtPayload();

  if (!payload) return;

  const userId = payload.sub;

  const questionOptions = await prisma.questionOption.findMany({
    where: { questionId },
  });

  try {
    await prisma.questionAnswer.updateMany({
      where: {
        userId,
        questionOptionId: {
          in: questionOptions.map((qo) => qo.id),
        },
      },
      data: {
        status: AnswerStatus.TimedOut,
      },
    });
  } catch {
    return { hasError: true };
  }
}

export async function markQuestionAsSkipped(questionId: number) {
  const payload = await getJwtPayload();

  if (!payload) return;

  const userId = payload.sub;

  const questionOptions = await prisma.questionOption.findMany({
    where: { questionId },
  });

  try {
    await prisma.questionAnswer.updateMany({
      where: {
        userId,
        questionOptionId: {
          in: questionOptions.map((qo) => qo.id),
        },
      },
      data: {
        status: AnswerStatus.Skipped,
      },
    });
  } catch {
    return { hasError: true };
  }
}
