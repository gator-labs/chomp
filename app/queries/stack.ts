"use server";

import {
  ChompResult,
  Deck,
  DeckQuestion,
  Question,
  QuestionAnswer,
  QuestionOption,
} from "@prisma/client";
import { isAfter, isBefore } from "date-fns";

import { getJwtPayload } from "../actions/jwt";
import prisma from "../services/prisma";

export async function getActiveAndInactiveStacks() {
  return prisma.stack.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });
}

export async function getActiveAndInactiveStack(stackId: number) {
  return prisma.stack.findUnique({
    where: {
      id: stackId,
    },
  });
}

export async function getStacks() {
  return prisma.stack.findMany({
    where: {
      isVisible: true,
      isActive: true,
    },
    orderBy: [{ name: "asc" }],
  });
}

export async function getStack(id: number) {
  const jwt = await getJwtPayload();
  const userId = jwt?.sub;
  const now = new Date();

  const stack = await prisma.stack.findUnique({
    where: {
      id,
    },
    include: {
      deck: {
        include: {
          deckQuestions: {
            include: {
              question: {
                include: {
                  chompResults: {
                    include: {
                      question: true,
                    },
                    where: {
                      userId,
                    },
                  },
                  questionOptions: {
                    include: {
                      questionAnswers: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!stack) {
    return null;
  }

  // Sort decks by revealAtDate (desc) and handle null dates
  const sortedDecks = [...stack.deck].sort((a, b) => {
    // Treat null dates as future dates (they should appear first)
    const aRevealDate = a.revealAtDate || new Date("2100-01-01");
    const bRevealDate = b.revealAtDate || new Date("2100-01-01");

    // First sort by revealAtDate descending
    if (aRevealDate > bRevealDate) return -1;
    if (aRevealDate < bRevealDate) return 1;

    // For same reveal dates, sort by activeFromDate and current date
    const aActiveDate = a.activeFromDate || new Date("2100-01-01");
    const bActiveDate = b.activeFromDate || new Date("2100-01-01");

    // If both are past active date, newer active date first
    if (aActiveDate <= now && bActiveDate <= now) {
      return bActiveDate.getTime() - aActiveDate.getTime();
    }

    // If only one is past active date, it goes first
    if (aActiveDate <= now) return -1;
    if (bActiveDate <= now) return 1;

    // If neither is past active date, earlier active date first
    return aActiveDate.getTime() - bActiveDate.getTime();
  });

  return {
    ...stack,
    deck: sortedDecks,
  };
}

export async function getStackImage(id: number) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  return prisma.stack.findUnique({
    where: {
      id,
      isVisible: true,
      isActive: true,
    },
    select: {
      image: true,
    },
  });
}

export async function getAllStacks() {
  const payload = await getJwtPayload();

  const userId = payload?.sub;

  const stacks = await prisma.stack.findMany({
    where: {
      isVisible: true,
    },
    include: {
      deck: {
        include: {
          deckQuestions: {
            include: {
              question: {
                include: {
                  chompResults: {
                    where: {
                      userId,
                    },
                  },
                  questionOptions: {
                    include: {
                      questionAnswers: {
                        where: {
                          userId,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });

  return stacks.map((stack) => ({
    ...stack,
    decks: stack.deck,
    decksToAnswer: !!userId ? getDecksToAnswer(stack.deck) : undefined,
    decksToReveal: !!userId ? getDecksToReveal(stack.deck) : undefined,
    deck: undefined,
  }));
}

export async function getDailyDecks() {
  const payload = await getJwtPayload();

  const userId = payload?.sub;

  const dailyDecks = await prisma.deck.findMany({
    where: {
      date: { not: null },
    },
    include: {
      deckQuestions: {
        include: {
          question: {
            include: {
              questionOptions: {
                include: {
                  questionAnswers: {
                    where: {
                      userId,
                    },
                  },
                },
              },
              chompResults: {
                where: {
                  userId,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    decks: dailyDecks,
    decksToAnswer: !!userId ? getDecksToAnswer(dailyDecks) : undefined,
    decksToReveal: !!userId ? getDecksToReveal(dailyDecks) : undefined,
  };
}

function getDecksToAnswer(
  decks: (Deck & {
    deckQuestions: (DeckQuestion & {
      question: Question & {
        questionOptions: (QuestionOption & {
          questionAnswers: QuestionAnswer[];
        })[];
      };
    })[];
  })[],
) {
  return decks.filter(
    (deck) =>
      isBefore(deck.activeFromDate!, new Date()) &&
      isAfter(deck.revealAtDate!, new Date()) &&
      deck.deckQuestions.flatMap((dq) => dq.question.questionOptions).length !==
        deck.deckQuestions.flatMap((dq) =>
          dq.question.questionOptions.flatMap((qo) => qo.questionAnswers),
        ).length,
  );
}

function getDecksToReveal(
  decks: (Deck & {
    deckQuestions: (DeckQuestion & {
      question: Question & {
        chompResults: ChompResult[];
      };
    })[];
  })[],
) {
  return decks.filter(
    (deck) =>
      isAfter(new Date(), deck.revealAtDate!) &&
      deck.deckQuestions.map((dq) => dq.question).length !==
        deck.deckQuestions.flatMap((dq) =>
          dq.question.chompResults.map((cr) => cr),
        ).length,
  );
}
