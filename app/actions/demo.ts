"use server";

import { addDays } from "date-fns";
import { redirect } from "next/navigation";
import prisma from "../services/prisma";
import { getJwtPayload } from "./jwt";

export async function resetAccountData() {
  const payload = await getJwtPayload();
  const userId = payload?.sub ?? "";
  if (!userId) {
    return;
  }

  const isDemo = process.env.ENVIRONMENT === "demo";
  if (!isDemo) {
    return;
  }

  await prisma.questionAnswer.deleteMany({
    where: {
      userId,
      questionOption: {
        question: {
          deckQuestions: {
            some: {
              deck: {
                deck: "Demo Daily Deck",
              },
            },
          },
        },
      },
    },
  });

  await prisma.userDeck.deleteMany({
    where: {
      userId,
      deck: {
        deck: "Demo Daily Deck",
      },
    },
  });

  await prisma.deck.updateMany({
    where: {
      deck: "Demo Daily Deck",
    },
    data: {
      date: new Date(),
      revealAtDate: addDays(new Date(), 3),
    },
  });

  await prisma.chompResult.deleteMany({
    where: {
      userId,
    },
  });

  await prisma.questionAnswer.deleteMany({
    where: {
      userId,
      questionOptionId: {
        in: [7, 8, 9, 10, 11, 12],
      },
    },
  });

  await prisma.questionAnswer.createMany({
    data: [
      {
        questionOptionId: 7,
        selected: true,
        userId,
        percentage: 50,
      },
      {
        questionOptionId: 8,
        selected: false,
        userId,
        percentage: 50,
      },
      {
        questionOptionId: 9,
        selected: true,
        userId,
        percentage: 26,
      },
      {
        questionOptionId: 10,
        selected: false,
        userId,
        percentage: 74,
      },
      {
        questionOptionId: 11,
        selected: true,
        userId,
        percentage: 40,
      },
      {
        questionOptionId: 12,
        selected: false,
        userId,
        percentage: 60,
      },
    ],
  });

  redirect("/application");
}
