"use server";

import {
  Deck,
  DeckQuestion,
  Question,
  QuestionAnswer,
  QuestionOption,
  QuestionTag,
  Tag,
} from "@prisma/client";
import { isAfter, isBefore } from "date-fns";
import dayjs from "dayjs";

import { getJwtPayload } from "../actions/jwt";
import prisma from "../services/prisma";
import { getTotalNumberOfDeckQuestions } from "../utils/question";

export async function getDailyDeck() {
  const currentDayStart = dayjs(new Date()).subtract(1, "day").toDate();
  const currentDayEnd = dayjs(new Date()).toDate();
  const payload = await getJwtPayload();

  if (!payload?.sub) return null;

  const dailyDeck = await prisma.deck.findFirst({
    orderBy: [{ date: "asc" }],
    where: {
      date: { gte: currentDayStart, lte: currentDayEnd },
      deckQuestions: {
        every: {
          question: {
            revealAtDate: {
              gte: new Date(),
            },
          },
        },
      },
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
                      userId: payload.sub,
                    },
                  },
                },
              },
              questionTags: {
                include: {
                  tag: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!dailyDeck) {
    return null;
  }

  const questions = mapQuestionFromDeck(dailyDeck);

  if (!questions.filter((q) => q.status === undefined).length) return null;

  return {
    questions,
    stackId: dailyDeck?.stackId,
    id: dailyDeck.id,
    date: dailyDeck.date,
  };
}

export async function getDeckQuestionsForAnswerById(deckId: number) {
  const payload = await getJwtPayload();
  if (!payload?.sub) return null;

  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
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
                      userId: payload.sub,
                    },
                  },
                },
              },
              questionTags: {
                include: {
                  tag: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!deck) {
    return null;
  }

  const deckQuestions = await prisma.deckQuestion.findMany({
    where: {
      deckId: deckId,
    },
    include: {
      question: {
        include: {
          questionOptions: {
            include: {
              questionAnswers: true,
            },
          },
        },
      },
    },
  });

  const totalDeckQuestions = getTotalNumberOfDeckQuestions(deckQuestions);

  const deckCreditCost =
    deck?.creditCostPerQuestion !== null
      ? deck?.creditCostPerQuestion * deckQuestions.length
      : null;

  if (!!deck.activeFromDate && isAfter(deck.activeFromDate, new Date())) {
    return {
      questions: deck?.deckQuestions,
      id: deck.id,
      date: deck.date,
      stackId: deck.stackId,
      name: deck.deck,
      totalDeckQuestions,
      revealAtDate: deck.revealAtDate,
      activeFromDate: deck.activeFromDate,
      deckCreditCost,
    };
  } else if (
    deck.deckQuestions.some((dq) =>
      isBefore(dq.question.revealAtDate!, new Date()),
    )
  ) {
    return {
      questions: [],
      id: deck.id,
      date: deck.date,
      revealAtDate: deck.revealAtDate,
      stackId: deck.stackId,
      totalDeckQuestions,
      deckCreditCost,
      deckInfo: {
        heading: deck.heading || deck.deck,
        description: deck.description,
        imageUrl: deck.imageUrl,
        footer: deck.footer,
      },
      activeFromDate: deck.activeFromDate,
    };
  }

  const questions = mapQuestionFromDeck(deck);

  return {
    questions,
    id: deck.id,
    date: deck.date,
    stackId: deck.stackId,
    deckCreditCost,
    numberOfUserAnswers: deck.deckQuestions.flatMap((dq) =>
      dq.question.questionOptions.flatMap((qo) => qo.questionAnswers),
    ).length,
    deckInfo: {
      heading: deck.heading || deck.deck,
      description: deck.description,
      imageUrl: deck.imageUrl,
      footer: deck.footer,
    },
    activeFromDate: deck.activeFromDate,
  };
}

const mapQuestionFromDeck = (
  deck: Deck & {
    deckQuestions: Array<
      DeckQuestion & {
        question: Question & {
          questionOptions: (QuestionOption & {
            questionAnswers?: QuestionAnswer[];
          })[];
          questionTags: (QuestionTag & { tag: Tag })[];
        };
      }
    >;
  },
) => {
  const questions = deck?.deckQuestions.map((dq) => ({
    id: dq.questionId,
    durationMiliseconds: Number(dq.question.durationMiliseconds),
    question: dq.question.question,
    type: dq.question.type,
    imageUrl: dq.question.imageUrl ?? undefined,
    questionOptions: dq.question.questionOptions.map((qo) => ({
      id: qo.id,
      option: qo.option,
      isLeft: qo.isLeft,
    })),
    questionTags: dq.question.questionTags,
    deckRevealAtDate: deck.revealAtDate,
    status: dq.question.questionOptions[0].questionAnswers?.[0]?.status,
    createdAt: dq.question.questionOptions[0].questionAnswers?.[0]?.createdAt,
  }));

  return questions;
};

export async function getDecks() {
  const decks = await prisma.deck.findMany({
    orderBy: [{ revealAtDate: "desc" }, { deck: "asc" }],
    include: {
      deckQuestions: {
        take: 1,
        include: {
          question: {
            include: {
              questionTags: {
                include: {
                  tag: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return decks;
}

export async function getDailyAnsweredQuestions() {
  const currentDayStart = dayjs(new Date()).subtract(1, "day").toDate();
  const currentDayEnd = dayjs(new Date()).toDate();
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const dailyDeck = await prisma.deck.findFirst({
    orderBy: [{ date: "asc" }],
    where: {
      date: { gte: currentDayStart, lte: currentDayEnd },
      deckQuestions: {
        every: {
          question: {
            revealAtDate: {
              gte: new Date(),
            },
          },
        },
      },
    },
    include: {
      deckQuestions: {
        include: {
          question: {
            include: {
              questionOptions: true,
            },
          },
        },
      },
    },
  });

  if (!dailyDeck) {
    return { answers: [], questions: [] };
  }

  const questionOptionIds = dailyDeck?.deckQuestions.flatMap((questions) =>
    questions.question.questionOptions.map((q) => q.id),
  );

  const answers = await prisma.questionAnswer.findMany({
    where: {
      userId: payload.sub,
      questionOptionId: {
        in: questionOptionIds,
      },
      selected: true,
    },
  });

  return { answers, questions: dailyDeck?.deckQuestions };
}

export async function getDeckSchema(id: number) {
  const deck = await prisma.deck.findUnique({
    where: {
      id,
    },
    include: {
      deckQuestions: {
        include: {
          question: {
            include: {
              questionOptions: true,
              questionTags: {
                include: {
                  tag: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!deck) {
    return null;
  }

  return {
    ...deck,
    revealAtDate: deck.revealAtDate!,
    revealToken: deck.deckQuestions[0]?.question.revealToken,
    revealTokenAmount: deck.deckQuestions[0]?.question.revealTokenAmount,
    tagIds: deck.deckQuestions[0]?.question.questionTags.map((qt) => qt.tag.id),
    deckQuestions: undefined,
    questions: deck.deckQuestions.map((dq) => ({
      ...dq.question,
      revealToken: undefined,
      revealTokenAmount: undefined,
      revealAtDate: undefined,
      revealAtAnswerCount: undefined,
      questionTags: undefined,
    })),
  };
}

export async function getCreditFreeDeckId() {
  const payload = await getJwtPayload();

  if (!payload?.sub) return null;

  const currentDayStart = dayjs(new Date()).startOf("day").toDate();
  const currentDayEnd = dayjs(new Date()).endOf("day").toDate();

  const freeExpiringDeckId = await prisma.deck.findFirst({
    select: {
      id: true,
    },
    where: {
      creditCostPerQuestion: 0,
      revealAtDate: { gt: new Date() },
      AND: [
        {
          OR: [
            { activeFromDate: { lte: new Date() } },
            { activeFromDate: null },
          ],
        },
        { date: { gte: currentDayStart, lte: currentDayEnd } },
      ],
      deckQuestions: {
        some: {
          question: {
            questionOptions: {
              some: {
                questionAnswers: {
                  none: {
                    userId: payload.sub,
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: [{ date: "asc" }, { revealAtDate: "asc" }],
  });

  return freeExpiringDeckId;
}
