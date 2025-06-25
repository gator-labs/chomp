"server-only";

import prisma from "@/app/services/prisma";
import { AdminActionError } from "@/lib/error";

export async function repairUserStreak(
  userId: string,
  date: Date,
  reason: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.streakExtension.findFirst({
      where: {
        userId,
        activityDate: date,
      },
    });

    if (existing)
      throw new AdminActionError(
        "Streak extension already exists for this user and date",
      );

    await tx.streakExtension.create({
      data: {
        userId,
        activityDate: date,
        streakValue: 0,
        reason,
      },
    });
  });
}

export async function repairAllStreaks(
  date: Date,
  reason: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.streakExtension.findFirst({
      where: {
        userId: null,
        activityDate: date,
      },
    });

    if (existing)
      throw new AdminActionError(
        "Global streak extension exists for this date",
      );

    await tx.streakExtension.create({
      data: {
        userId: null,
        activityDate: date,
        streakValue: 0,
        reason,
      },
    });
  });
}
