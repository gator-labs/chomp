"use server";

import { FungibleAsset, ResultType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import prisma from "../services/prisma";
import { calculateRevealPoints } from "../utils/points";
import { getQuestionState, isEntityRevealable } from "../utils/question";
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

  const questionIds = await prisma.deckQuestion.findMany({
    where: {
      deckId: { in: deckIds },
      question: { chompResults: { none: { userId: payload.sub } } },
    },
    select: { questionId: true },
  });

  await revealQuestions(questionIds.map((q) => q.questionId));
  revalidatePath("/application");
}

export async function revealQuestions(questionIds: number[]) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const questions = await prisma.question.findMany({
    where: {
      id: { in: questionIds },
    },
    select: {
      id: true,
      revealAtDate: true,
      revealAtAnswerCount: true,
      chompResults: {
        where: {
          userId: payload.sub,
        },
        select: {
          id: true,
        },
      },
      questionOptions: {
        select: {
          questionAnswers: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  const revealableQuestions = questions.filter(
    (question) =>
      question.chompResults.length === 0 &&
      isEntityRevealable({
        revealAtDate: question.revealAtDate,
        revealAtAnswerCount: question.revealAtAnswerCount,
        answerCount: question.questionOptions[0].questionAnswers.length,
      }),
  );

  const decksOfQuestions = await prisma.deck.findMany({
    where: {
      deckQuestions: { some: { questionId: { in: questionIds } } },
      chompResults: { none: { userId: payload.sub } },
    },
    include: {
      deckQuestions: {
        include: {
          question: {
            include: {
              questionOptions: {
                include: {
                  questionAnswers: { where: { userId: payload.sub } },
                },
              },
              chompResults: { where: { userId: payload.sub } },
            },
          },
        },
      },
    },
  });

  const decksToAddRevealFor = decksOfQuestions.filter((deck) => {
    const questionStates = deck.deckQuestions.map((dq) => ({
      questionId: dq.questionId,
      state: getQuestionState(dq.question),
    }));

    const alreadyRevealed = questionStates
      .filter((qs) => qs.state.isRevealed)
      .map((qs) => qs.questionId);

    const newlyRevealed = questionStates
      .filter(
        (qs) =>
          revealableQuestions.some((rq) => rq.id === qs.questionId) &&
          !qs.state.isRevealed,
      )
      .map((qs) => qs.questionId);

    const revealedQuestions = [...alreadyRevealed, ...newlyRevealed];
    const allQuestionIds = deck.deckQuestions.map((dq) => dq.questionId);

    const remainingQuestions = allQuestionIds.filter(
      (qId) => !revealedQuestions.includes(qId),
    );

    return remainingQuestions.length === 0;
  });

  await prisma.$transaction(async (tx) => {
    await tx.chompResult.createMany({
      data: [
        ...questionIds.map((questionId) => ({
          questionId,
          userId: payload.sub,
          result: ResultType.Revealed,
        })),
        ...decksToAddRevealFor.map((deck) => ({
          deckId: deck.id,
          userId: payload.sub,
          result: ResultType.Revealed,
        })),
      ],
    });

    const revealResult = await calculateRevealPoints(
      payload.sub,
      questionIds.filter((questionId) => questionId !== null) as number[],
    );

    const fungibleAssetRevealTasks = revealResult.map((rr) =>
      incrementFungibleAssetBalance(
        FungibleAsset.Point,
        rr.amount,
        rr.type,
        tx,
      ),
    );

    await Promise.all(fungibleAssetRevealTasks);
  });

  revalidatePath("/application");
}

export async function dismissQuestion(questionId: number) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const chompResult = await prisma.chompResult.findFirst({
    where: {
      userId: payload.sub,
      questionId: questionId,
    },
  });

  await prisma.chompResult.upsert({
    create: {
      result: ResultType.Dismissed,
      userId: payload.sub,
      questionId: questionId,
    },
    update: {
      result: ResultType.Dismissed,
    },
    where: {
      id: chompResult?.id ?? 0,
    },
  });

  revalidatePath("/application");
}
