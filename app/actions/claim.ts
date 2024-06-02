"use server";

import { ResultType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import prisma from "../services/prisma";
import { getJwtPayload } from "./jwt";

export async function claimDeck(deckId: number) {
  const decks = await claimDecks([deckId]);
  return decks ? decks[0] : null;
}

export async function claimQuestion(questionId: number) {
  const questions = await claimQuestions([questionId]);
  return questions ? questions[0] : null;
}

export async function claimDecks(deckIds: number[]) {
  const questions = await prisma.deckQuestion.findMany({
    where: {
      deckId: {
        in: deckIds,
      },
    },
  });

  return await claimQuestions(questions.map((q) => q.questionId));
}

export async function claimQuestions(questionIds: number[]) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const chompResults = await prisma.chompResult.findMany({
    where: {
      userId: payload.sub,
      questionId: {
        in: questionIds,
      },
      result: ResultType.Revealed,
    },
  });

  await prisma.$transaction(async (tx) => {
    await tx.chompResult.updateMany({
      where: {
        id: {
          in: chompResults.map((r) => r.id),
        },
      },
      data: {
        result: ResultType.Claimed,
      },
    });

    const decks = await tx.deck.findMany({
      where: {
        deckQuestions: {
          every: {
            question: {
              chompResults: {
                some: {
                  userId: payload.sub,
                  result: ResultType.Revealed,
                },
              },
            },
          },
        },
      },
      include: {
        chompResults: {
          where: {
            userId: payload.sub,
          },
        },
      },
    });

    const deckRevealsToUpdate = decks
      .filter((deck) => deck.chompResults && deck.chompResults.length > 0)
      .map((deck) => deck.id);

    if (deckRevealsToUpdate.length > 0) {
      await tx.chompResult.updateMany({
        where: {
          deckId: { in: deckRevealsToUpdate },
        },
        data: {
          result: ResultType.Claimed,
        },
      });
    }

    const deckRevealsToCreate = decks
      .filter((deck) => !deck.chompResults || deck.chompResults.length === 0)
      .map((deck) => deck.id);

    if (deckRevealsToCreate.length > 0) {
      await tx.chompResult.createMany({
        data: deckRevealsToCreate.map((deckId) => ({
          deckId,
          userId: payload.sub,
          result: ResultType.Revealed,
        })),
      });
    }
  });

  revalidatePath("/application");
}
