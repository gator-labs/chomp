"use server";

import { revalidatePath } from "next/cache";
import prisma from "../services/prisma";
import { getQuestionState, isEntityRevealable } from "../utils/question";
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
      question: { reveals: { none: { userId: payload.sub } } },
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
      reveals: {
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
      question.reveals.length === 0 &&
      isEntityRevealable({
        revealAtDate: question.revealAtDate,
        revealAtAnswerCount: question.revealAtAnswerCount,
        answerCount: question.questionOptions[0].questionAnswers.length,
      }),
  );

  const decksOfQuestions = await prisma.deck.findMany({
    where: {
      deckQuestions: { some: { questionId: { in: questionIds } } },
      reveals: { none: { userId: payload.sub } },
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
              reveals: { where: { userId: payload.sub } },
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

    const newelyRevealed = questionStates
      .filter(
        (qs) =>
          revealableQuestions.some((rq) => rq.id === qs.questionId) &&
          !qs.state.isRevealed,
      )
      .map((qs) => qs.questionId);

    const revealedQuestions = [...alreadyRevealed, ...newelyRevealed];
    const allQuestionIds = deck.deckQuestions.map((dq) => dq.questionId);

    const remainigQuestions = allQuestionIds.filter(
      (qId) => !revealedQuestions.includes(qId),
    );

    return remainigQuestions.length === 0;
  });

  await prisma.$transaction(async (tx) => {
    await tx.reveal.createMany({
      data: [
        ...questionIds.map((questionId) => ({
          questionId,
          userId: payload.sub,
        })),
        ...decksToAddRevealFor.map((deck) => ({
          deckId: deck.id,
          userId: payload.sub,
        })),
      ],
    });
  });

  revalidatePath("/application");
}
