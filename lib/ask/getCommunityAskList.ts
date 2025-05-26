"server-only";

import prisma from "@/app/services/prisma";
import { CommunityAskFilter, CommunityAskSortBy, SortOrder } from "@/types/ask";
import {
  DeckQuestion,
  Question,
  QuestionOption,
  User,
  Wallet,
} from "@prisma/client";

export type CommunityAskQuestion = Question & {
  questionOptions: QuestionOption[];
  addedToDeckAt: Date | null;
  user: User & { wallets: Wallet[] };
  deckQuestions?: DeckQuestion[];
};

const getSortQuery = (
  _filter: CommunityAskFilter,
  sortBy: CommunityAskSortBy,
  sortOrder: SortOrder,
) => {
  if (sortBy === "userId") {
    return { user: { id: sortOrder } };
  }

  return { createdAt: sortOrder };
};

export async function getCommunityAskList(
  filter: CommunityAskFilter,
  sortBy: CommunityAskSortBy,
  sortOrder: SortOrder,
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

  const sortQuery = getSortQuery(filter, sortBy, sortOrder);

  const askList = await prisma.question.findMany({
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
      ...(filter === "accepted" ? { deckQuestions: true } : null),
    },
    orderBy: sortQuery,
  });

  return askList.map((question) => ({
    ...question,
    addedToDeckAt: question.deckQuestions?.[0].createdAt ?? null,
  })) as CommunityAskQuestion[];
}
