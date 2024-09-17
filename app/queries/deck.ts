"use server";

import { Prisma } from ".prisma/client";
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

const questionDeckToRunInclude = {
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
} satisfies Prisma.DeckInclude;

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
    id: dailyDeck.id,
    date: dailyDeck.date,
  };
}

/**
 * Get the daily deck for Farcaster Frame.
 * There is no logged in user in this context.
 */
export async function getDailyDeckForFrame() {
  // const currentDayStart = dayjs(new Date()).startOf("day").toDate();
  // const currentDayEnd = dayjs(new Date()).endOf("day").toDate();

  const dailyDeck = await prisma.deck.findFirst({
    where: {
      date: { not: null }, //, gte: currentDayStart, lte: currentDayEnd }
    },
    orderBy: {
      date: "desc",
    },
    include: questionDeckToRunInclude,
  });

  if (!dailyDeck) {
    return { questions: [] };
  }

  const questions = mapQuestionFromDeck(dailyDeck);

  return {
    questions,
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

  if (!!deck.activeFromDate && isAfter(deck.activeFromDate, new Date())) {
    return {
      questions: deck?.deckQuestions,
      id: deck.id,
      date: deck.date,
      name: deck.deck,
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
    };
  }

  const questions = mapQuestionFromDeck(deck);

  return {
    questions,
    id: deck.id,
    date: deck.date,
    numberOfUserAnswers: deck.deckQuestions.flatMap((dq) =>
      dq.question.questionOptions.flatMap((qo) => qo.questionAnswers),
    ).length,
    deckInfo: {
      heading: deck.heading || deck.deck,
      description: deck.description,
      imageUrl: deck.imageUrl,
      footer: deck.footer,
    },
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
