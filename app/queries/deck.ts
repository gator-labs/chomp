"use server";

import { Prisma } from ".prisma/client";
import {
  Deck,
  DeckQuestion,
  Question,
  QuestionOption,
  QuestionTag,
  Tag,
} from "@prisma/client";
import { addSeconds } from "date-fns";
import dayjs from "dayjs";
import { addPlaceholderAnswers } from "../actions/answer";
import { getJwtPayload } from "../actions/jwt";
import prisma from "../services/prisma";
import { mapPercentageResult, populateAnswerCount } from "../utils/question";
import { answerPercentageQuery } from "./answerPercentageQuery";

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
  const currentDayStart = dayjs(new Date()).startOf("day").toDate();
  const currentDayEnd = dayjs(new Date()).endOf("day").toDate();
  const payload = await getJwtPayload();

  const dailyDeck = await prisma.deck.findFirst({
    where: {
      date: { gte: currentDayStart, lte: currentDayEnd },
      isActive: true,
      deckQuestions: {
        every: {
          question: {
            revealAtDate: {
              gte: new Date(),
            },
          },
        },
      },
      ...(payload
        ? { userDeck: { none: { userId: payload?.sub ?? "" } } }
        : {}),
    },
    include: questionDeckToRunInclude,
  });

  if (!dailyDeck) {
    return null;
  }

  const questions = mapQuestionFromDeck(dailyDeck);

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
  if (!payload) {
    return null;
  }

  const deck = await prisma.deck.findFirst({
    where: { id: { equals: deckId }, isActive: true },
    include: questionDeckToRunInclude,
  });

  if (!deck) {
    return null;
  }

  const questions = mapQuestionFromDeck(deck);
  await addPlaceholderAnswers(
    deck.deckQuestions.flatMap((dq) => dq.question.questionOptions),
    payload.sub,
  );
  return questions;
}

const mapQuestionFromDeck = (
  deck: Deck & {
    deckQuestions: Array<
      DeckQuestion & {
        question: Question & {
          questionOptions: QuestionOption[];
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
  }));

  return questions;
};

export async function getDecks() {
  const decks = await prisma.deck.findMany({
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
    revealToken: deck.deckQuestions[0].question.revealToken,
    revealTokenAmount: deck.deckQuestions[0].question.revealTokenAmount,
    tagIds: deck.deckQuestions[0].question.questionTags.map((qt) => qt.tag.id),
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

export async function getDeckDetails(id: number) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const deck = await prisma.deck.findFirst({
    where: {
      id: {
        equals: id,
      },
    },
    include: {
      chompResults: {
        where: { userId: payload.sub },
      },
      deckQuestions: {
        include: {
          question: {
            include: {
              questionOptions: {
                include: {
                  questionAnswers: true,
                },
              },
              chompResults: {
                where: { userId: payload.sub },
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

  const questions = deck?.deckQuestions.flatMap((dq) => dq.question);
  const questionOptionIds = questions.flatMap((q) =>
    q.questionOptions?.map((qo) => qo.id),
  );
  const questionOptionPercentages =
    await answerPercentageQuery(questionOptionIds);

  const populated = populateAnswerCount(deck);
  mapPercentageResult(questions, questionOptionPercentages);

  return { ...deck, answerCount: populated.answerCount ?? 0 };
}

export async function hasAnsweredDeck(
  deckId: number,
  userId: string | null = null,
  ignorePlaceholder = false,
) {
  if (!userId) {
    const payload = await getJwtPayload();
    if (!payload) {
      return true;
    }

    userId = payload?.sub;
  }

  const questionAnswerWhereInput: Prisma.QuestionAnswerWhereInput =
    ignorePlaceholder ? { hasViewedButNotSubmitted: false } : {};

  const answeredCount = await prisma.questionAnswer.count({
    where: {
      createdAt: {
        lt: addSeconds(new Date(), -20),
      },
      userId: { equals: userId },
      questionOption: {
        question: { deckQuestions: { some: { deckId: { equals: deckId } } } },
      },

      ...questionAnswerWhereInput,
    },
  });

  return answeredCount > 0;
}
