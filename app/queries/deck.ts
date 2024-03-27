import { Prisma } from ".prisma/client";
import prisma from "../services/prisma";
import dayjs from "dayjs";

const questionDeckToRunInclude = {
  questionDecks: {
    include: {
      question: {
        include: {
          questionOptions: true,
        },
      },
    },
  },
} satisfies Prisma.DeckInclude;

export async function getDailyDeck() {
  const currentDayStart = dayjs(new Date()).startOf("day").toDate();
  const currentDayEnd = dayjs(new Date()).endOf("day").toDate();

  const dailyDeck = await prisma.deck.findFirst({
    where: { date: { not: null, gte: currentDayStart, lte: currentDayEnd } },
    include: questionDeckToRunInclude,
  });

  return dailyDeck;
}

export async function getDeckDetailsById(deckId: number) {
  const deck = await prisma.deck.findFirst({
    where: { id: { equals: deckId } },
    include: questionDeckToRunInclude,
  });

  return deck;
}
