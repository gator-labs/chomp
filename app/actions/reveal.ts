"use server";

import { revalidatePath } from "next/cache";
import prisma from "../services/prisma";
import { getJwtPayload } from "./jwt";
import { incrementFungibleAssetBalance } from "./fungible-asset";
import { FungibleAsset } from "@prisma/client";
import { pointsPerAction } from "../constants/points";

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

  await prisma.$transaction(async (tx) => {
    await tx.reveal.createMany({
      data: deckIds.map((deckId) => ({
        deckId,
        userId: payload.sub,
      })),
    });

    // TODO
    await incrementFungibleAssetBalance(FungibleAsset.Point, 0, tx);
  });

  revalidatePath("/application");
}

export async function revealQuestions(questionIds: number[]) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  await prisma.$transaction(async (tx) => {
    await tx.reveal.createMany({
      data: questionIds.map((questionId) => ({
        questionId,
        userId: payload.sub,
      })),
    });

    // TODO
    await incrementFungibleAssetBalance(FungibleAsset.Point, 0, tx);
  });

  revalidatePath("/application");
}
