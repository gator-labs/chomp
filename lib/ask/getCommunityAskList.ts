"server-only";

import { CommunityAskFilter } from '@/types/ask';

import prisma from "@/app/services/prisma";
import { Question, QuestionOption, User, Wallet } from "@prisma/client";

export type CommunityAskQuestion = Question & {
  questionOptions: QuestionOption[];
  addedToDeckAt: Date | null;
  user: User & { wallets: Wallet[] };
};

export async function getCommunityAskList(
  filter: CommunityAskFilter,
): Promise<CommunityAskQuestion[]> {
  const filterQuery =
    filter === "pending"
      ? {
          deckQuestions: {
            none: {},
          },
          isArchived: false,
        }
      : filter === "accepted"
        ? {
            deckQuestions: {
              some: {},
            },
          }
        : {
            isArchived: true,
          };

  const askList = (await prisma.question.findMany({
    where: {
      isSubmittedByUser: true,
      createdByUserId: { not: null },
      ...filterQuery,
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
