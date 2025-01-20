"use server";

import { stringifyDecimals } from "@/app/utils/decimal";
import {
  ChompResult,
  Deck,
  DeckQuestion,
  Question,
  QuestionAnswer,
  QuestionOption,
} from "@prisma/client";
import { Prisma } from "@prisma/client";
import { isAfter, isBefore } from "date-fns";
import Decimal from "decimal.js";

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
                      // If user isn't logged in, match against a non-existent user
                      // to avoid pulling records for ALL users. We keep this clause
                      // so the type contains chompResult (empty array).
                      userId: userId ?? "00000000-0000-0000-0000-000000000000",
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

  stringifyDecimals(stack);

  const sortedDecks = [...stack.deck].sort((a, b) => {
    if (
      a.activeFromDate &&
      b.activeFromDate &&
      a.revealAtDate &&
      b.revealAtDate
    ) {
      const activeFromDateA = new Date(a.activeFromDate);
      const activeFromDateB = new Date(b.activeFromDate);
      const revealAtDateA = new Date(a.revealAtDate);
      const revealAtDateB = new Date(b.revealAtDate);

      // Open answer period
      const isOpenA = revealAtDateA > now && activeFromDateA <= now;
      const isOpenB = revealAtDateB > now && activeFromDateB <= now;

      // Upcoming answer period
      const isUpcomingA = activeFromDateA > now;
      const isUpcomingB = activeFromDateB > now;

      // Closed answer period
      const isClosedA = revealAtDateA <= now;
      const isClosedB = revealAtDateB <= now;

      // Group 1: Open answer periods (ascending `revealAtDate`)
      if (isOpenA && isOpenB) {
        return revealAtDateA.getTime() - revealAtDateB.getTime();
      }
      if (isOpenA !== isOpenB) {
        return isOpenA ? -1 : 1; // Open periods come first
      }

      // Group 2: Upcoming answer periods (ascending `activeFromDate`)
      if (isUpcomingA && isUpcomingB) {
        return activeFromDateA.getTime() - activeFromDateB.getTime();
      }
      if (isUpcomingA !== isUpcomingB) {
        return isUpcomingA ? -1 : 1; // Upcoming periods come after open
      }

      // Group 3: Closed answer periods (descending `revealAtDate`)
      if (isClosedA && isClosedB) {
        return revealAtDateB.getTime() - revealAtDateA.getTime();
      }

      return 0; // Default case
    }

    return 0; // Default equality case
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
