"use server";

import { MYSTERY_BOXES_PER_PAGE } from "@/app/constants/mysteryBox";
import { authGuard } from "@/app/utils/auth";
import { EMysteryBoxCategory } from "@/types/mysteryBox";
import { MysteryBox } from "@/types/mysteryBox";
import { EMysteryBoxStatus } from "@prisma/client";

import prisma from "../../services/prisma";

/**
 * Fetches the mystery box history for the authenticated user
 * @param currentPage - The page number to fetch
 * @returns A promise with the mystery box data and whether there are more pages
 */
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
          triggerType: {
            in: ["ValidationReward", "CampaignReward"],
          },
          MysteryBoxPrize: {
            some: {}, // Ensures there is at least one MysteryBoxPrize
          },
        },
      },
    },
    include: {
      triggers: {
        select: {
          id: true,
          triggerType: true,
          questionId: true,
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

  const hasMore = records.length === MYSTERY_BOXES_PER_PAGE + 1;

  if (hasMore) records.pop();

  const mysteryBoxes = await Promise.all(
    records.map(async (box) => {
      let creditsReceived = 0;
      let bonkReceived = 0;
      let openedAt = null;

      const allPrizes = box.triggers.flatMap(
        (trigger) => trigger.MysteryBoxPrize,
      );

      for (const prize of allPrizes) {
        if (prize.prizeType === "Credits") {
          creditsReceived += parseFloat(prize.amount);
        } else if (
          prize.prizeType === "Token" &&
          prize.tokenAddress === bonkAddress
        ) {
          bonkReceived += parseFloat(prize.amount);
        }

        if (!openedAt && prize.claimedAt) {
          openedAt = prize.claimedAt.toISOString();
        }
      }

      const triggerType = box.triggers?.[0].triggerType;

      let category;

      if (
        triggerType === "RevealAllCompleted" ||
        triggerType === "DailyDeckCompleted" ||
        triggerType === "ClaimAllCompleted" ||
        triggerType === "ValidationReward"
      ) {
        category = EMysteryBoxCategory.Validation;
      } else if (triggerType === "TutorialCompleted") {
        category = EMysteryBoxCategory.Practice;
      } else {
        category = EMysteryBoxCategory.Campaign;
      }
      return {
        id: box.id,
        creditsReceived: creditsReceived.toString(),
        bonkReceived: bonkReceived.toString(),
        openedAt: openedAt ?? null,
        category,
      };
    }),
  );

  return { data: mysteryBoxes, hasMore };
}
