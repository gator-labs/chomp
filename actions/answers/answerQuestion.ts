"use server";

import { incrementFungibleAssetBalance } from "@/app/actions/fungible-asset";
import { getJwtPayload } from "@/app/actions/jwt";
import { pointsPerAction } from "@/app/constants/points";
import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import { addUserTutorialTimestamp } from "@/app/queries/user";
import prisma from "@/app/services/prisma";
import { AnswerError } from "@/lib/error";
import {
  AnswerStatus,
  FungibleAsset,
  QuestionAnswer,
  QuestionType,
  TransactionLogType,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";

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
        questionAnswers: {
          where: {
            userId,
          },
        },
      },
    });

    if (!questionOptions.length) {
      throw new Error(
        `Question with id: ${request.questionId} does not exist or it is revealed and cannot be answered.`,
      );
    }

    const questionAnswers = questionOptions.map((qo) => {
      const isOptionSelected = qo.id === request?.questionOptionId;

      const percentageForQuestionOption =
        request?.percentageGivenForAnswerId === qo.id
          ? request?.percentageGiven
          : undefined;

      const percentage = percentageForQuestionOption;

      if (
        qo.questionAnswers[0].questionOptionId ===
          request.percentageGivenForAnswerId &&
        qo.questionAnswers[0].isAssigned2ndOrderOption !== true &&
        qo.question.type === QuestionType.MultiChoice
      ) {
        throw new Error(
          `User with id: ${payload?.sub} second order respose doesn't match the give random option id for question id ${request.questionId}.`,
        );
      }
      return {
        id: qo.questionAnswers[0].id,
        selected: isOptionSelected,
        percentage,
        questionOptionId: qo.id,
        timeToAnswer: request?.timeToAnswerInMiliseconds
          ? BigInt(request?.timeToAnswerInMiliseconds)
          : null,
        userId,
        status: AnswerStatus.Submitted,
        isAssigned2ndOrderOption:
          qo.questionAnswers[0].isAssigned2ndOrderOption,
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
      userQuestionAnswers.some((qa) => qa.status !== AnswerStatus.Viewed)
    ) {
      throw new Error(
        `User with id: ${payload?.sub} has already answered question with id: ${request.questionId}`,
      );
    }

    if (userQuestionAnswers.length === 0) {
      throw new Error(
        `User with id: ${payload?.sub} has not paid to answer question with id: ${request.questionId}`,
      );
    }

    await prisma.$transaction(async (tx) => {
      // Question answers are deleted because they have (possibly)
      // been marked seen and will be recreated below.
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

      const deckQuestions = await tx.deckQuestion.findMany({
        where: {
          deckId: request.deckId,
        },
        include: {
          deck: true,
          question: {
            include: {
              questionOptions: {
                include: {
                  questionAnswers: {
                    where: {
                      userId,
                    },
                  },
                },
              },
            },
          },
        },
      });
      const allQuestionOptions = deckQuestions.flatMap((dq) =>
        dq.question.questionOptions.map((qo) => qo),
      );
      const allQuestionAnswers = allQuestionOptions.flatMap((qo) =>
        qo.questionAnswers.filter((qa) => qa.status === AnswerStatus.Submitted),
      );

      const isPaidQuestion =
        questionOptions[0].question.creditCostPerQuestion &&
        questionOptions[0].question.creditCostPerQuestion > 0;

      const fungibleAssetRevealTasks = [
        incrementFungibleAssetBalance({
          asset: FungibleAsset.Point,
          amount:
            pointsPerAction[
              isPaidQuestion
                ? TransactionLogType.AnswerPaidQuestion
                : TransactionLogType.AnswerQuestion
            ],
          transactionLogType: isPaidQuestion
            ? TransactionLogType.AnswerPaidQuestion
            : TransactionLogType.AnswerQuestion,
          injectedPrisma: tx,
          questionIds: [request.questionId],
        }),
      ];
      if (allQuestionOptions.length === allQuestionAnswers.length) {
        fungibleAssetRevealTasks.push(
          incrementFungibleAssetBalance({
            asset: FungibleAsset.Point,
            amount: pointsPerAction[TransactionLogType.AnswerDeck],
            transactionLogType: TransactionLogType.AnswerDeck,
            injectedPrisma: tx,
            deckIds: [request.deckId!],
          }),
        );
      }
      await Promise.all(fungibleAssetRevealTasks);
    });
  } catch (error) {
    const answerError = new AnswerError(
      `User with id: ${payload?.sub} is having trouble answering question with id: ${request.questionId}`,
      { cause: error },
    );
    Sentry.captureException(answerError);
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    throw error;
  }
}
