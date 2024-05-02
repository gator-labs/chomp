"use server";

import { FungibleAsset } from "@prisma/client";
import { revalidatePath } from "next/cache";
import prisma from "../services/prisma";
import { calculateRevealPoints } from "../utils/points";
import { incrementFungibleAssetBalance } from "./fungible-asset";
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

  const reveals = await prisma.reveal.findMany({
    where: {
      userId: payload.sub,
      questionId: {
        in: questionIds,
      },
      isRewardClaimed: false,
    },
  });

  await prisma.$transaction(async (tx) => {
    await tx.reveal.updateMany({
      where: {
        id: {
          in: reveals.map((r) => r.id),
        },
      },
      data: {
        isRewardClaimed: true,
      },
    });

    const decks = await tx.deck.findMany({
      where: {
        deckQuestions: {
          every: {
            question: {
              reveals: {
                some: {
                  userId: payload.sub,
                  isRewardClaimed: true,
                },
              },
            },
          },
        },
      },
      include: {
        reveals: {
          where: {
            userId: payload.sub,
          },
        },
      },
    });

    const deckRevealsToUpdate = decks
      .filter((deck) => deck.reveals && deck.reveals.length > 0)
      .map((deck) => deck.id);

    if (deckRevealsToUpdate.length > 0) {
      await tx.reveal.updateMany({
        where: {
          deckId: { in: deckRevealsToUpdate },
        },
        data: {
          isRewardClaimed: true,
        },
      });
    }

    const deckRevealsToCreate = decks
      .filter((deck) => !deck.reveals || deck.reveals.length === 0)
      .map((deck) => deck.id);

    if (deckRevealsToCreate.length > 0) {
      await tx.reveal.createMany({
        data: deckRevealsToCreate.map((deckId) => ({
          deckId,
          userId: payload.sub,
          isRewardClaimed: true,
        })),
      });
    }

    const revealResult = await calculateRevealPoints(
      payload.sub,
      reveals
        .map((r) => r.questionId)
        .filter((questionId) => questionId !== null) as number[],
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
