"use server";

import {
  FungibleAsset,
  QuestionAnswer,
  QuestionOption,
  QuestionType,
  TransactionLogType,
} from "@prisma/client";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import { pointsPerAction } from "../constants/points";
import { hasAnsweredDeck } from "../queries/deck";
import { hasAnsweredQuestion } from "../queries/question";
import { addUserTutorialTimestamp } from "../queries/user";
import prisma from "../services/prisma";
import { incrementFungibleAssetBalance } from "./fungible-asset";
import { getJwtPayload } from "./jwt";
import { updateStreak } from "./streak";

export type SaveQuestionRequest = {
  questionId: number;
  questionOptionId?: number;
  percentageGiven?: number;
  percentageGivenForAnswerId?: number;
  timeToAnswerInMiliseconds?: number;
  hasViewedButNotSubmitted?: boolean;
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

export async function saveDeck(request: SaveQuestionRequest[], deckId: number) {
  const payload = await getJwtPayload();
  const userId = payload?.sub ?? "";
  if (!userId) {
    return;
  }

  const hasAnswered = await hasAnsweredDeck(deckId, userId, true);

  if (hasAnswered) {
    return;
  }

  const deck = await prisma.deck.findFirst({
    where: { id: { equals: deckId } },
  });

  if (deck?.revealAtDate && dayjs(deck?.revealAtDate).isBefore(new Date())) {
    return;
  }

  const questionIds = request.map((dr) => dr.questionId);

  const questionOptions = await prisma.questionOption.findMany({
    where: { questionId: { in: questionIds } },
    include: { question: true },
  });

  const questionAnswers = questionOptions.map((qo) => {
    const answerForQuestion = request.find(
      (r) => r.questionId === qo.questionId,
    );
    const isOptionSelected = qo.id === answerForQuestion?.questionOptionId;

    const percentageForQuestionOption =
      answerForQuestion?.percentageGivenForAnswerId === qo.id
        ? answerForQuestion?.percentageGiven
        : undefined;

    const percentage =
      qo.question.type === QuestionType.BinaryQuestion &&
      !percentageForQuestionOption
        ? 100 - answerForQuestion!.percentageGiven!
        : percentageForQuestionOption;

    return {
      selected: isOptionSelected,
      percentage,
      hasViewedButNotSubmitted: answerForQuestion?.hasViewedButNotSubmitted,
      questionOptionId: qo.id,
      timeToAnswer: answerForQuestion?.timeToAnswerInMiliseconds
        ? BigInt(answerForQuestion?.timeToAnswerInMiliseconds)
        : null,
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

    const fungibleAssetRevealTasks = [
      incrementFungibleAssetBalance({
        asset: FungibleAsset.Point,
        amount: pointsPerAction[TransactionLogType.AnswerQuestion],
        transactionLogType: TransactionLogType.AnswerQuestion,
        injectedPrisma: tx,
        questionIds,
      }),
      incrementFungibleAssetBalance({
        asset: FungibleAsset.Point,
        amount: pointsPerAction[TransactionLogType.AnswerDeck],
        transactionLogType: TransactionLogType.AnswerDeck,
        injectedPrisma: tx,
        deckIds: [deckId],
      }),
    ];

    await updateStreak(userId);
    await Promise.all(fungibleAssetRevealTasks);
  });

  revalidatePath("/application");
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

  await removePlaceholderAnswerByQuestion(request.questionId, userId);
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
  });

  revalidatePath("/application");
}

export async function removePlaceholderAnswerByQuestion(
  questionId: number,
  userId: string,
) {
  await prisma.questionAnswer.deleteMany({
    where: {
      questionOption: { questionId },
      userId,
      hasViewedButNotSubmitted: true,
    },
  });
}

export async function removePlaceholderAnswerByDeck(
  deckId: number,
  userId: string,
) {
  await prisma.questionAnswer.deleteMany({
    where: {
      questionOption: { question: { deckQuestions: { some: { deckId } } } },
      userId,
      hasViewedButNotSubmitted: true,
    },
  });
}

export async function addPlaceholderAnswers(
  questionOptions: QuestionOption[],
  userId: string,
) {
  const placeholderQuestionAnswers = questionOptions.map(
    (qo) =>
      ({
        userId: userId,
        hasViewedButNotSubmitted: true,
        questionOptionId: qo.id,
        selected: false,
      }) as QuestionAnswer,
  );

  await prisma.questionAnswer.createMany({ data: placeholderQuestionAnswers });

  revalidatePath("/application");
}
