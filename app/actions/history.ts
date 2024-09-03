"use server";

import {
  getDecksHistory,
  getQuestionsHistoryQuery,
  QuestionHistory,
} from "../queries/history";
import prisma from "../services/prisma";
import { getJwtPayload } from "./jwt";

const PAGE_SIZE = 10;

export const getHistoryDecks = async () => {
  const payload = await getJwtPayload();

  if (!payload?.sub) {
    return [];
  }

  return getDecksHistory(payload.sub);
};

export const getQuestionsHistory = async ({
  pageParam,
}: {
  pageParam: number;
}): Promise<QuestionHistory[]> => {
  const payload = await getJwtPayload();

  if (!payload?.sub) {
    return [];
  }

  return getQuestionsHistoryQuery(payload.sub, PAGE_SIZE, pageParam);
};

export async function getTotalClaimableRewards() {
  const payload = await getJwtPayload();

  if (!payload) {
    return;
  }

  const res = await prisma.chompResult.findMany({
    where: {
      userId: payload.sub,
      result: "Revealed",
      questionId: { not: null },
      rewardTokenAmount: {
        gt: 0,
      },
    },
    include: {
      question: true,
    },
  });

  return {
    questions: res.map((q) => q.question),
    totalClaimableRewards: res.reduce(
      (acc, curr) => acc + (curr?.rewardTokenAmount?.toNumber() ?? 0),
      0,
    ),
  };
}
