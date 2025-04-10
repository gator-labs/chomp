"server-only";

import prisma from "@/app/services/prisma";
import {
  ESpecialStack,
  FungibleAsset,
  TransactionLogType,
} from "@prisma/client";

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
        isVisible: false,
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
    const question = await tx.question.findFirstOrThrow({
      where: {
        id: questionId,
        isSubmittedByUser: true,
        createdByUserId: { not: null },
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

    const CREDITS_REWARD = Number(
      process.env.NEXT_PUBLIC_ASK_ACCEPTED_CREDITS_REWARD ?? 0,
    );

    if (CREDITS_REWARD) {
      // Reward question author
      await tx.fungibleAssetTransactionLog.create({
        data: {
          type: TransactionLogType.AskQuestionAccepted,
          questionId: questionId,
          asset: FungibleAsset.Credit,
          change: Number(process.env.NEXT_PUBLIC_ASK_ACCEPTED_CREDITS_REWARD),
          userId: question.createdByUserId!,
        },
      });
    }
  });
}
