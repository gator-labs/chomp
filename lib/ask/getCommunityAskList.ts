"server-only";

import prisma from "@/app/services/prisma";
import { Question, QuestionOption, User, Wallet } from "@prisma/client";

export type CommunityAskQuestion = Question & {
  questionOptions: QuestionOption[];
  addedToDeckAt: Date | null;
  user: User & { wallets: Wallet[] };
};

export async function getCommunityAskList(): Promise<CommunityAskQuestion[]> {
  // TODO: update to fetch only community questions
  const askList = await prisma.question.findMany({
    include: {
      questionOptions: true,
    },
  });

  // TODO: remove this and get real author in the query above
  const user = await prisma.user.findFirstOrThrow({
    include: {
      wallets: true,
    },
  });

  return askList.map((question) => ({
    ...question,
    addedToDeckAt: null,
    user: user,
  }));
}
