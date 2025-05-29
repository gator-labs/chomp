"server-only";

import prisma from "@/app/services/prisma";

export async function archiveQuestion(questionId: number): Promise<void> {
  await prisma.question.update({
    data: {
      isArchived: true,
    },
    where: {
      id: questionId,
      isSubmittedByUser: true,
      deckQuestions: {
        none: {},
      },
    },
  });
}
