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
        orderBy: [{ revealAtDate: "desc" }],
      },
    },
  });

  if (stack === null) {
    return null;
  }

  const filteredDecks = stack.deck.sort((a, b) => {
    const currentDate = new Date();

    // Handle null dates by treating them as future dates
    if (!a.revealAtDate && !b.revealAtDate) return 0;
    if (!a.revealAtDate) return -1;
    if (!b.revealAtDate) return 1;

    const revealDateA = new Date(a.revealAtDate);
    const revealDateB = new Date(b.revealAtDate);

    // If either deck is past reveal date, sort it later
    if (revealDateA < currentDate && revealDateB >= currentDate) return 1;
    if (revealDateB < currentDate && revealDateA >= currentDate) return -1;

    // For decks with same reveal date status, sort by activeFromDate
    const activeFromDateA = a.activeFromDate
      ? new Date(a.activeFromDate)
      : new Date();
    const activeFromDateB = b.activeFromDate
      ? new Date(b.activeFromDate)
      : new Date();

    const isPastA = activeFromDateA < currentDate;
    const isPastB = activeFromDateB < currentDate;

    if (isPastA && !isPastB) return -1;
    if (!isPastA && isPastB) return 1;

    // For decks with same active status, sort by activeFromDate
    if (isPastA && isPastB) {
      return activeFromDateB.getTime() - activeFromDateA.getTime();
    }
    return activeFromDateA.getTime() - activeFromDateB.getTime();
  });

  return {
    id: stack.id,
    name: stack.name,
    isActive: stack.isActive,
    isVisible: stack.isVisible,
    image: stack.image,
    deck: filteredDecks,
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
