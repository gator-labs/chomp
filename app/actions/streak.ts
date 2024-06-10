"use server";

import { Streak } from "@prisma/client";
import dayjs from "dayjs";
import prisma from "../services/prisma";

export async function updateStreak(userId: string): Promise<Streak> {
  const streakDb = await prisma.streak.findFirst({
    where: { userId },
    orderBy: { lastDayOfStreak: "desc" },
  });

  if (!streakDb) {
    return await prisma.streak.create({
      data: { userId },
    });
  }

  if (dayjs(streakDb.lastDayOfStreak).isSame(dayjs(), "date")) {
    return streakDb;
  }

  if (
    dayjs(streakDb.lastDayOfStreak).isSame(dayjs().subtract(1, "day"), "date")
  ) {
    return prisma.streak.update({
      data: {
        lastDayOfStreak: new Date(),
      },
      where: { id: streakDb.id },
    });
  }

  return await prisma.streak.create({
    data: { userId },
  });
}
