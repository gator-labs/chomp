"use server";

import { MYSTERY_BOXES_PER_PAGE } from "@/app/constants/mysteryBox";
import { authGuard } from "@/app/utils/auth";
import { EMysteryBoxCategory } from "@/types/mysteryBox";
import { MysteryBox } from "@/types/mysteryBox";
import { EBoxTriggerType } from "@prisma/client";

import prisma from "../../services/prisma";

export async function fetchAllMysteryBoxes({
  currentPage,
}: {
  currentPage: number;
}): Promise<{ data: MysteryBox[]; hasMore: boolean }> {
  const payload = await authGuard();

  const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

  const pageSkip = (currentPage - 1) * MYSTERY_BOXES_PER_PAGE;

  const records = await prisma.mysteryBox.findMany({
    where: {
      userId: payload.sub,
      triggers: {
        some: {
          triggerType: {
            in: [
              EBoxTriggerType.ClaimAllCompleted,
              EBoxTriggerType.ClaimAllCompleted,
              EBoxTriggerType.RevealAllCompleted,
            ],
          },
        },
      },
    },
    include: {
      MysteryBoxPrize: {
        select: {
          id: true,
          prizeType: true,
          amount: true,
          tokenAddress: true,
          claimedAt: true,
        },
      },
      triggers: true,
    },
    skip: pageSkip,
    take: MYSTERY_BOXES_PER_PAGE + 1,
    orderBy: { createdAt: "desc" },
  });

  const hasMore = records.length == MYSTERY_BOXES_PER_PAGE + 1;

  if (hasMore) records.pop();

  const mysteryBoxes = records.map((box) => {
    let creditsReceived = "0";
    let bonkReceived = "0";
    let openedAt = null;

    for (let i = 0; i < box.MysteryBoxPrize.length; i++) {
      const prize = box.MysteryBoxPrize[i];
      if (prize.prizeType == "Credits") creditsReceived = prize.amount;
      else if (prize.prizeType == "Token" && prize.tokenAddress == bonkAddress)
        bonkReceived = prize.amount;

      if (!openedAt) openedAt = prize.claimedAt?.toISOString();
    }

    const triggerType = box.triggers?.[0].triggerType;

    let category;

    if (
      triggerType == "RevealAllCompleted" ||
      triggerType == "DailyDeckCompleted" ||
      triggerType == "ClaimAllCompleted"
    )
      category = EMysteryBoxCategory.Validation;
    else if (triggerType == "TutorialCompleted")
      category = EMysteryBoxCategory.Practice;
    else category = EMysteryBoxCategory.Campaign;

    return {
      id: box.id,
      creditsReceived,
      bonkReceived,
      openedAt: openedAt ?? null,
      category,
    };
  });

  return { data: mysteryBoxes, hasMore };
}
