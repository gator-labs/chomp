"use server";

import {
  AnswerStatus,
  FungibleAsset,
  QuestionAnswer,
  QuestionType,
  TransactionLogType,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import { release } from "os";
import { pointsPerAction } from "../constants/points";
import { hasAnsweredQuestion } from "../queries/question";
import { addUserTutorialTimestamp } from "../queries/user";
import prisma from "../services/prisma";
import { AnswerError } from "../utils/error";
import { sendAnswerStatusToMixpanel } from "../utils/mixpanel";
import { incrementFungibleAssetBalance } from "./fungible-asset";
import { getJwtPayload } from "./jwt";
import { updateStreak } from "./streak";

export type SaveQuestionRequest = {
  questionId: number;
  questionOptionId?: number;
  percentageGiven?: number;
  percentageGivenForAnswerId?: number;
  timeToAnswerInMiliseconds?: number;
  deckId?: number;
};

export async function addTutorialPoints(
  isCorrectFirstOrderMultipleQuestion: boolean,
) {
  const totalNumberOfTutorialQuestions = 2;

  const fungibleAssetRevealTasks = [
    incrementFungibleAssetBalance({
      asset: FungibleAsset.Point,
      amount:
        totalNumberOfTutorialQuestions *
        pointsPerAction[TransactionLogType.AnswerQuestion],
      transactionLogType: TransactionLogType.AnswerQuestion,
    }),
    incrementFungibleAssetBalance({
      asset: FungibleAsset.Point,
      amount: pointsPerAction[TransactionLogType.AnswerDeck],
      transactionLogType: TransactionLogType.AnswerDeck,
    }),

    incrementFungibleAssetBalance({
      asset: FungibleAsset.Point,
      amount: pointsPerAction[TransactionLogType.RevealAnswer],
      transactionLogType: TransactionLogType.RevealAnswer,
    }),
  ];

  if (isCorrectFirstOrderMultipleQuestion)
    fungibleAssetRevealTasks.push(
      incrementFungibleAssetBalance({
        asset: FungibleAsset.Point,
        amount: pointsPerAction[TransactionLogType.CorrectFirstOrder],
        transactionLogType: TransactionLogType.CorrectFirstOrder,
      }),
    );

  await Promise.all(fungibleAssetRevealTasks);
  await addUserTutorialTimestamp();
  revalidatePath("/tutorial");
}

export async function answerQuestion(request: SaveQuestionRequest) {
  const payload = await getJwtPayload();
  const userId = payload?.sub ?? "";

  if (!userId) return;

  try {
    const questionOptions = await prisma.questionOption.findMany({
      where: { questionId: request.questionId },
      include: { question: true },
    });

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

      const fungibleAssetRevealTasks = [
        incrementFungibleAssetBalance({
          asset: FungibleAsset.Point,
          amount: pointsPerAction[TransactionLogType.AnswerQuestion],
          transactionLogType: TransactionLogType.AnswerQuestion,
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

        if (!!deckQuestions[0].deck.date) await updateStreak(userId);
      }

      await Promise.all(fungibleAssetRevealTasks);

      sendAnswerStatusToMixpanel(request, "SUCCEEDED");
    });
  } catch (error) {
    sendAnswerStatusToMixpanel(request, "FAILED");
    const answerError = new AnswerError(
      `User with id: ${payload?.sub} is having trouble answering question with id: ${request.questionId}`,
      { cause: error },
    );
    Sentry.captureException(answerError);
    release();
    throw error;
  }
}

export async function saveQuestion(request: SaveQuestionRequest) {
  const payload = await getJwtPayload();

  if (
    request.percentageGiven === undefined ||
    !request.questionOptionId ||
    !payload
  ) {
    return;
  }

  try {
    const userId = payload?.sub ?? "";

    const hasAnswered = await hasAnsweredQuestion(
      request.questionId,
      userId,
      true,
    );

    if (hasAnswered) {
      return;
    }

    const question = await prisma.question.findFirst({
      where: { id: { equals: request.questionId } },
    });

    if (
      question?.revealAtDate &&
      dayjs(question?.revealAtDate).isBefore(new Date())
    ) {
      return;
    }

    const questionOptions = await prisma.questionOption.findMany({
      where: { questionId: request.questionId },
      include: { question: true },
    });

    const questionAnswers = questionOptions.map((qo) => {
      const isOptionSelected = qo.id === request?.questionOptionId;

      const percentageForQuestionOption =
        request?.percentageGivenForAnswerId === qo.id
          ? request.percentageGiven
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
      } as QuestionAnswer;
    });

    await prisma.$transaction(async (tx) => {
      await tx.questionAnswer.createMany({
        data: questionAnswers,
      });

      await incrementFungibleAssetBalance({
        asset: FungibleAsset.Point,
        amount: pointsPerAction[TransactionLogType.AnswerQuestion],
        transactionLogType: TransactionLogType.AnswerQuestion,
        injectedPrisma: tx,
        questionIds: [request.questionId],
      });

      await updateStreak(userId);
      sendAnswerStatusToMixpanel(request, "SUCCEEDED");
    });

    revalidatePath("/application");
  } catch (error) {
    sendAnswerStatusToMixpanel(request, "FAILED");
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    return { hasError: true };
  }
}
