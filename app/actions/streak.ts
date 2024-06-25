"use server";

import { Streak } from "@prisma/client";
import dayjs from "dayjs";
import prisma from "../services/prisma";

export async function updateStreak(
  userId: string,
): Promise<Streak | undefined> {
  const todaysDeck = await prisma.deck.findFirst({
    where: {
      date: {
        gte: dayjs().startOf("date").toDate(),
        lte: dayjs().endOf("date").toDate(),
        not: null,
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  const previousDeck = await prisma.deck.findFirst({
    where: {
      date: {
        lt: dayjs().startOf("date").toDate(),
        not: null,
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  if (!todaysDeck) {
    return;
  }

  const streakDb = await prisma.streak.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  if (!streakDb) {
    return await prisma.streak.create({
      data: { userId, count: 1 },
    });
  }

  if (dayjs(streakDb.updatedAt).isSame(dayjs(), "date")) {
    return;
  }

  if (dayjs(streakDb.updatedAt).isSame(previousDeck?.date, "date")) {
    return prisma.streak.update({
      data: {
        count: { increment: 1 },
      },
      where: { id: streakDb.id },
    });
  }

  return await prisma.streak.create({
    data: { userId, count: 1 },
  });
}
