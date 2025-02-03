"use server";

import {
  QuestionHistory,
  getDecksHistory,
  getHistoryHeadersData,
  getNewHistoryQuery,
  getQuestionsHistoryQuery,
  newQuestionHistory,
  newQuestionHistoryData,
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
  deckId,
}: {
  pageParam: number;
  deckId?: number;
}): Promise<QuestionHistory[]> => {
  const payload = await getJwtPayload();

  if (!payload?.sub) {
    return [];
  }

  return getQuestionsHistoryQuery(
    payload.sub,
    PAGE_SIZE,
    pageParam,
    deckId,
    "isRevealable",
  );
};

export const getNewQuestionHistory = async ({
  pageParam,
  deckId,
}: {
  pageParam: number;
  deckId?: number;
}): Promise<newQuestionHistory[]> => {
  const payload = await getJwtPayload();

  if (!payload?.sub) {
    return [];
  }

  return getNewHistoryQuery(payload.sub, PAGE_SIZE, pageParam, deckId);
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
      sendTransactionSignature: null,
      rewardTokenAmount: {
        gt: 0,
      },
      OR: [
        {
          burnTransactionSignature: {
            not: null,
          },
        },
        {
          revealNftId: {
            not: null,
          },
        },
      ],
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

export async function getDeckTotalClaimableRewards(deckId: number) {
  const payload = await getJwtPayload();

  if (!payload) {
    return;
  }

  const res = await prisma.chompResult.findMany({
    where: {
      userId: payload.sub,
      result: "Revealed",
      questionId: { not: null },
      sendTransactionSignature: null,
      rewardTokenAmount: {
        gt: 0,
      },
      AND: {
        question: {
          deckQuestions: {
            some: {
              deckId,
            },
          },
        },
      },
    },
    include: {
      question: {
        include: {
          deckQuestions: {
            where: {
              deckId,
            },
            select: {
              deckId: true,
            },
          },
        },
      },
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

export async function getNewHistoryHeaderData(
  deckId?: number,
): Promise<newQuestionHistoryData> {
  const payload = await getJwtPayload();

  if (!payload?.sub) {
    return {
      correctCount: 0,
      incorrectCount: 0,
      unansweredCount: 0,
      unrevealedCount: 0,
    };
  }

  return getHistoryHeadersData(payload.sub, deckId);
}
