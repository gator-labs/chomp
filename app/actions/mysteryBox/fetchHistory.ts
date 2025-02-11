"use server";

import { MYSTERY_BOXES_PER_PAGE } from "@/app/constants/mysteryBox";
import { authGuard } from "@/app/utils/auth";
import { EMysteryBoxCategory } from "@/types/mysteryBox";
import { MysteryBox } from "@/types/mysteryBox";
import { EMysteryBoxStatus } from "@prisma/client";

import prisma from "../../services/prisma";

export async function fetchMysteryBoxHistory({
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
      status: EMysteryBoxStatus.Opened,
      triggers: {
        some: {
          triggerType: {},
          MysteryBoxPrize: {
            some: {}, // Ensures there is at least one MysteryBoxPrize
          },
        },
      },
    },
    include: {
      triggers: {
        select: {
          triggerType: true,
          MysteryBoxPrize: {
            select: {
              id: true,
              prizeType: true,
              amount: true,
              tokenAddress: true,
              claimedAt: true,
            },
          },
        },
      },
    },
    skip: pageSkip,
    take: MYSTERY_BOXES_PER_PAGE + 1,
    orderBy: { createdAt: "desc" },
  });

  const hasMore = records.length == MYSTERY_BOXES_PER_PAGE + 1;

  if (hasMore) records.pop();

  const mysteryBoxes = records.map((box) => {
    let creditsReceived = 0;
    let bonkReceived = 0;
    let openedAt = null;

    const allPrizes = box.triggers.flatMap(
      (trigger) => trigger.MysteryBoxPrize,
    );

    for (let i = 0; i < allPrizes.length; i++) {
      const prize = allPrizes[i];

      if (prize.prizeType == "Credits") {
        creditsReceived += parseFloat(prize.amount); // Sum the credits amount
      } else if (
        prize.prizeType == "Token" &&
        prize.tokenAddress == bonkAddress
      ) {
        bonkReceived += parseFloat(prize.amount); // Sum the bonk amount
      }

      if (!openedAt) openedAt = prize.claimedAt?.toISOString();
    }
    const triggerType = box.triggers?.[0].triggerType;

    let category;

    if (
      triggerType == "RevealAllCompleted" ||
      triggerType == "DailyDeckCompleted" ||
      triggerType == "ClaimAllCompleted" ||
      triggerType == "ValidationReward"
    )
      category = EMysteryBoxCategory.Validation;
    else if (triggerType == "TutorialCompleted")
      category = EMysteryBoxCategory.Practice;
    else category = EMysteryBoxCategory.Campaign;

    return {
      id: box.id,
      creditsReceived: creditsReceived.toString(),
      bonkReceived: bonkReceived.toString(),
      openedAt: openedAt ?? null,
      category,
    };
  });

  return { data: mysteryBoxes, hasMore };
}
