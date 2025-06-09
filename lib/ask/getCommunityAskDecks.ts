"server-only";

import prisma from "@/app/services/prisma";
import { CommunityAskDeck } from "@/types/ask";
import { ESpecialStack } from "@prisma/client";

export async function getCommunityAskDecks(): Promise<CommunityAskDeck[]> {
  let stack = await prisma.stack.findUnique({
    where: {
      specialId: ESpecialStack.CommunityAsk,
    },
  });

  if (!stack) return [];

  const now = new Date();

  const decks = await prisma.deck.findMany({
    select: {
      id: true,
      deck: true,
    },
    where: {
      stackId: stack.id,
      OR: [{ activeFromDate: null }, { activeFromDate: { gt: now } }],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return decks.map((deck) => ({
    id: deck.id,
    title: deck.deck,
  }));
}
