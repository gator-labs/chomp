"server-only";

import prisma from "@/app/services/prisma";
import { ESpecialStack } from "@prisma/client";

export async function createCommunityDeck(title: string): Promise<number> {
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

  const deck = await prisma.deck.create({
    data: {
      stackId: stack.id,
      deck: title,
    },
  });

  return deck.id;
}
