"use server";

import { stringifyDecimals } from "@/app/utils/decimal";
import {
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
                  questionOptions: {
                    include: {
                      questionAnswers: {
                        where: {
                          userId:
                            // If user isn't logged in, match against a non-existent user
                            // to avoid pulling records for ALL users.
                            userId ?? "00000000-0000-0000-0000-000000000000",
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
  });

  if (!stack) {
    return null;
  }

  stringifyDecimals(stack);

  const sortedDecks = [...stack.deck]
    .map((deck) => {
      const totalCreditCost = deck.deckQuestions.reduce((total, dq) => {
        return total + (dq.question.creditCostPerQuestion || 0);
      }, 0);

      const totalRewardAmount = deck.deckQuestions.reduce((total, dq) => {
        return total + (dq.question.revealTokenAmount || 0);
      }, 0);

      // Calculate total questions (count of distinct question IDs)
      const totalQuestions = deck.deckQuestions.length;

      // Calculate answered questions (count of distinct questions that have been answered)
      const answeredQuestions = new Set(
        deck.deckQuestions
          .filter((dq) =>
            dq.question.questionOptions.some((qo) =>
              qo.questionAnswers.some((qa) => qa.userId === userId),
            ),
          )
          .map((dq) => dq.question.id),
      ).size;

      return {
        ...deck,
        totalCreditCost,
        totalRewardAmount,
        totalQuestions,
        answeredQuestions,
      };
    })
    .sort((a, b) => {
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
                  questionOptions: {
                    include: {
                      questionAnswers: {
                        where: {
                          // If user isn't logged in, match against a non-existent user
                          // to avoid pulling records for ALL users. We keep this clause
                          // so the type contains chompResult (empty array).
                          userId:
                            userId ?? "00000000-0000-0000-0000-000000000000",
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
                      userId: userId ?? "00000000-0000-0000-0000-000000000000",
                    },
                  },
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

  const decksWithCosts = dailyDecks.map((deck) => {
    const totalCreditCost = deck.deckQuestions.reduce((total, dq) => {
      return total + (dq.question.creditCostPerQuestion || 0);
    }, 0);

    const totalRewardAmount = deck.deckQuestions.reduce((total, dq) => {
      return total + (dq.question.revealTokenAmount || 0);
    }, 0);

    // Calculate total questions (count of distinct question IDs)
    const totalQuestions = deck.deckQuestions.length;

    // Calculate answered questions (count of distinct questions that have been answered)
    const answeredQuestions = new Set(
      deck.deckQuestions
        .filter((dq) =>
          dq.question.questionOptions.some((qo) =>
            qo.questionAnswers.some(
              (qa) =>
                qa.userId === userId &&
                (qa.status === "Submitted" || qa.status === "Viewed"),
            ),
          ),
        )
        .map((dq) => dq.question.id),
    ).size;

    return {
      ...deck,
      totalCreditCost,
      totalRewardAmount,
      totalQuestions,
      answeredQuestions,
    };
  });

  return {
    decks: decksWithCosts,
    decksToAnswer: !!userId ? getDecksToAnswer(decksWithCosts) : undefined,
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
