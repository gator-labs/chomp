"server-only";

import prisma from "@/app/services/prisma";

export async function addToCommunityDeck(questionId: number): Promise<void> {
  // TODO: implement

  // 1. Create deck if needed, assigned to appropriate stack

  // 2. Assign question to the above deck

  // 3. Sync any values (credit cost, etc.) to deck

  await prisma.question.findFirstOrThrow({ where: { id: questionId } });
}
