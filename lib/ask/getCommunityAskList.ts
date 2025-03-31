"server-only";

import prisma from "@/app/services/prisma";
import { Question, QuestionOption, User, Wallet } from "@prisma/client";

export type CommunityAskQuestion = Question & {
  questionOptions: QuestionOption[];
  addedToDeckAt: Date | null;
  user: User & { wallets: Wallet[] };
};

export async function getCommunityAskList(): Promise<CommunityAskQuestion[]> {
  const askList = (await prisma.question.findMany({
    where: {
      isSubmittedByUser: true,
      deckQuestions: {
        none: {},
      },
      createdBy: { not: null },
    },
    include: {
      user: {
        include: {
          wallets: true,
        },
      },
      questionOptions: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as CommunityAskQuestion[];

  return askList.map((question) => ({
    ...question,
    addedToDeckAt: null,
  }));
}
