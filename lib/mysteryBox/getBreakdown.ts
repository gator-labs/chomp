"use server";

import prisma from "@/app/services/prisma";
import { MysteryBoxBreakdown } from "@/types/mysteryBox";
import { EMysteryBoxStatus } from "@prisma/client";

export async function getMysteryBoxBreakdown(
  userId: string,
  mysteryBoxId: string,
) {
  const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

  const box = await prisma.mysteryBox.findFirst({
    where: {
      userId,
      id: mysteryBoxId,
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
  });

  if (!box) throw new Error("Box not found");

  const questionIds = box.triggers
    .filter((trigger) => trigger.questionId !== null)
    .map((trigger) => trigger.questionId) as number[];

  const boxBreakdown: MysteryBoxBreakdown[] = [];

  if (questionIds.length == 0) return boxBreakdown;

  const deckQuestions = await prisma.deckQuestion.findMany({
    where: {
      questionId: { in: questionIds },
    },
    include: {
      deck: {
        select: {
          id: true,
          deck: true,
          revealAtDate: true,
        },
      },
    },
  });

  // deck ID -> deck info
  const decksMap = new Map<
    number,
    {
      id: number;
      name: string;
      creditsReceived: number;
      bonkReceived: number;
      revealedOn: string | null;
      questionIds: Set<number>;
    }
  >();

  // question ID -> deck ID
  const questionsMap = new Map<number, number>();

  // Process deck questions to build the map of decks
  deckQuestions.forEach((dq) => {
    const deckId = dq.deckId;

    if (!decksMap.has(deckId)) {
      decksMap.set(deckId, {
        id: deckId,
        name: dq.deck.deck,
        creditsReceived: 0,
        bonkReceived: 0,
        revealedOn: dq.deck.revealAtDate
          ? dq.deck.revealAtDate.toISOString()
          : null,
        questionIds: new Set(),
      });
    }

    decksMap.get(deckId)!.questionIds.add(dq.questionId);
    questionsMap.set(dq.questionId, deckId);
  });

  // Process each trigger to add up prizes by deck
  box.triggers.forEach((trigger) => {
    if (!trigger.questionId) return;

    const deckId = questionsMap.get(trigger.questionId);

    if (!deckId) return;

    const deckInfo = decksMap.get(deckId);

    if (!deckInfo) return;

    trigger.MysteryBoxPrize.forEach((prize) => {
      if (prize.prizeType === "Credits") {
        deckInfo.creditsReceived += parseFloat(prize.amount);
      } else if (
        prize.prizeType === "Token" &&
        prize.tokenAddress === bonkAddress
      ) {
        deckInfo.bonkReceived += parseFloat(prize.amount);
      }
    });
  });

  decksMap.forEach((deckInfo) => {
    boxBreakdown.push({
      id: deckInfo.id,
      name: deckInfo.name,
      creditsReceived: deckInfo.creditsReceived,
      bonkReceived: deckInfo.bonkReceived,
      revealedOn: deckInfo.revealedOn,
    });
  });

  return boxBreakdown;
}
