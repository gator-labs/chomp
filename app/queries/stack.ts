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

  return prisma.stack.findUnique({
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
    decksToAnswer: !!userId ? getDecksToAnswer(stack.deck) : undefined,
    decksToReveal: !!userId ? getDecksToReveal(stack.deck) : undefined,
  }));
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
