"use server";

import { revalidatePath } from "next/cache";
import prisma from "../services/prisma";
import { isQuestionRevealable } from "../utils/question";
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

  await prisma.reveal.createMany({
    data: deckIds.map((deckId) => ({
      deckId,
      userId: payload.sub,
    })),
  });

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
      isQuestionRevealable({
        revealAtDate: question.revealAtDate,
        revealAtAnswerCount: question.revealAtAnswerCount,
        answerCount: question.questionOptions.reduce(
          (acc, cur) => acc + cur.questionAnswers.length,
          0,
        ),
      }),
  );

  await prisma.reveal.createMany({
    data: revealableQuestions.map((question) => ({
      questionId: question.id,
      userId: payload.sub,
    })),
  });

  revalidatePath("/application");
}
