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
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  await prisma.$transaction(async (tx) => {
    await tx.reveal.updateMany({
      where: {
        userId: payload.sub,
        deckId: {
          in: deckIds,
        },
      },
      data: {
        isRewardClaimed: true,
      },
    });

    await incrementFungibleAssetBalance(
      FungibleAsset.Point,
      await calculateRevealPoints(payload.sub, deckIds, !!"isDeck"),
      tx,
    );
  });

  revalidatePath("/application");
}

export async function claimQuestions(questionIds: number[]) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  await prisma.$transaction(async (tx) => {
    await tx.reveal.updateMany({
      where: {
        userId: payload.sub,
        questionId: {
          in: questionIds,
        },
      },
      data: {
        isRewardClaimed: true,
      },
    });

    await incrementFungibleAssetBalance(
      FungibleAsset.Point,
      await calculateRevealPoints(payload.sub, questionIds),
      tx,
    );
  });

  revalidatePath("/application");
}
