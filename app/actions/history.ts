"use server";

import { DeckHistoryItem } from "@/types/history";

import { HISTORY_DECK_LIMIT } from "../constants/decks";
import {
  NewQuestionHistory,
  NewQuestionHistoryData,
  QuestionHistory,
  getAnsweredDecksForHistory,
  getHistoryHeadersData,
  getNewHistoryQuery,
  getQuestionsHistoryQuery,
} from "../queries/history";
import prisma from "../services/prisma";
import { getJwtPayload } from "./jwt";

const PAGE_SIZE = 10;

export const getHistoryDecks = async ({
  pageParam,
}: {
  pageParam: number;
}): Promise<DeckHistoryItem[]> => {
  const payload = await getJwtPayload();

  if (!payload?.sub) {
    return [];
  }

  return getAnsweredDecksForHistory(payload.sub, HISTORY_DECK_LIMIT, pageParam);
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
}): Promise<NewQuestionHistory[]> => {
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
): Promise<NewQuestionHistoryData> {
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
