"server-only";

import prisma from "@/app/services/prisma";

export async function repairUserStreak(
  userId: string,
  date: Date,
  reason: string,
): Promise<void> {
  await prisma.streakExtension.create({
    data: {
      userId,
      activityDate: date,
      streakValue: 0,
      reason,
    },
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
      throw new Error("Global streak extension exists for this date");

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
