"server-only";

import prisma from "@/app/services/prisma";

export async function unarchiveQuestion(questionId: number): Promise<void> {
  await prisma.question.update({
    data: {
      isArchived: false,
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
