"server-only";

import prisma from "@/app/services/prisma";
import { ESpecialStack } from "@prisma/client";

export async function addToCommunityDeck(questionId: number): Promise<void> {
  let stack = await prisma.stack.findUnique({
    where: {
      specialId: ESpecialStack.CommunityAsk,
    },
  });

  if (!stack) {
    stack = await prisma.stack.create({
      data: {
        name: "Community Stack",
        specialId: ESpecialStack.CommunityAsk,
        isActive: false,
        image: "",
      },
    });
  }

  await prisma.$transaction(async (tx) => {
    const now = new Date();

    let deck = await tx.deck.findFirst({
      where: {
        stackId: stack.id,
        OR: [{ activeFromDate: null }, { activeFromDate: { gt: now } }],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!deck) {
      deck = await tx.deck.create({
        data: {
          stackId: stack.id,
          deck: "Community Deck",
        },
      });
    }

    // Ensure the question exists
    await tx.question.findFirstOrThrow({
      where: {
        id: questionId,
        isSubmittedByUser: true,
        deckQuestions: {
          none: {},
        },
      },
    });

    await tx.deckQuestion.create({
      data: {
        questionId,
        deckId: deck.id,
      },
    });

    // Sync values from the parent deck
    await tx.question.update({
      data: {
        creditCostPerQuestion: deck.creditCostPerQuestion,
        revealAtDate: deck.revealAtDate,
        revealAtAnswerCount: deck.revealAtAnswerCount,
      },
      where: {
        id: questionId,
      },
    });
  });
}
