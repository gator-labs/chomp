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
import { QuestionAuthor } from "../types/question-author";
export async function getRawDeck(deckId: number) {
  const deck = await prisma.deck.findUnique({
    where: {
      id: deckId,
    },
  });

  return deck;
}

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

/**
 * Gets a deck by id for logged-out users
 * @param deckId
 * @returns the deck with questions for logged-out users, or null if not found/not active
 */
export async function getActiveDeckForLoggedOutUsers(deckId: number) {
  const now = new Date();

  const deckWithQuestionsAndCount = await prisma.deck.findUnique({
    where: {
      id: deckId,
      OR: [
        {
          activeFromDate: {
            lt: now, // activeFromDate < now (already active)
          },
        },
        {
          activeFromDate: null, // No date implies a daily deck
        },
      ],
      revealAtDate: {
        gt: now, // revealAtDate > now (not revealed yet)
      },
    },
    include: {
      stack: true, // Include stack information to check for CommunityAsk
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
              // Include user and wallet data for authors functionality
              user: {
                include: {
                  wallets: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          deckQuestions: true,
        },
      },
    },
  });

  if (!deckWithQuestionsAndCount) {
    return null;
  }

  // Deck Questions flattened array
  const deckQuestions = deckWithQuestionsAndCount.deckQuestions.map(
    (dq) => dq.question,
  );

  // Calculate the sum of the cost of all questions
  // NOTICE: we are using the Question.creditCostPerQuestion and not the Deck.creditCostPerQuestion
  //  if every creditCostPerQuestion is null then our deck is legacy and has no cost to answer (null)
  //  otherwise calculate the cost by summing the price of all questions
  const areAllQuestionCostsNull = deckQuestions.every(
    (dq) => dq.creditCostPerQuestion == null,
  );

  let deckCreditCost;
  if (areAllQuestionCostsNull) {
    // deck is legacy, free to answer
    deckCreditCost = null;
  } else {
    // deck is current version
    deckCreditCost = deckQuestions.reduce((total, dq) => {
      return total + (dq.creditCostPerQuestion || 0);
    }, 0);
  }

  // calculate the reward amount by summing all revealTokenAmount
  const deckRewardAmount = deckQuestions.reduce((total, dq) => {
    return total + (dq.revealTokenAmount || 0);
  }, 0);

  // Collect all unique authors from all questions in the deck (deck-level authors)
  const isCommunityAsk = deckWithQuestionsAndCount.stack?.specialId === "CommunityAsk";
  let deckAuthors: Array<QuestionAuthor> = [];

  if (isCommunityAsk) {
    const authorsMap = new Map<string, QuestionAuthor>();
    
    deckWithQuestionsAndCount.deckQuestions.forEach((dq) => {
      if (dq.question.user && dq.question.user.wallets && dq.question.user.wallets.length > 0) {
        const user = dq.question.user;
        const authorKey = user.wallets[0].address; // Use wallet address as unique key
        
        if (!authorsMap.has(authorKey)) {
          authorsMap.set(authorKey, {
            address: user.wallets[0].address,
            username: user.username || undefined,
            avatarUrl: user.profileSrc || undefined,
          });
        }
      }
    });
    
    deckAuthors = Array.from(authorsMap.values());
  }

  return {
    ...deckWithQuestionsAndCount,
    totalDeckQuestions: deckWithQuestionsAndCount._count.deckQuestions,
    deckCreditCost,
    deckRewardAmount,
    deckInfo: {
      heading:
        deckWithQuestionsAndCount.heading || deckWithQuestionsAndCount.deck,
      description: deckWithQuestionsAndCount.description,
      imageUrl: deckWithQuestionsAndCount.imageUrl,
      footer: deckWithQuestionsAndCount.footer,
      author: deckWithQuestionsAndCount.author,
      authorImageUrl: deckWithQuestionsAndCount.authorImageUrl,
    },
    questions: mapQuestionFromDeckWithAuthors(deckWithQuestionsAndCount),
    authors: deckAuthors,
  };
}

/**
 * Gets a deck by id and returns it with its cost and rewards
 * for unanswered questions for a specific userId
 * user for loggedIn users who haven't started a deck
 * or are going to continue it
 */
export async function getDeckQuestionsForAnswerById(deckId: number) {
  const payload = await getJwtPayload();
  if (!payload?.sub) return null;

  const userId = payload.sub;

  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
    },
    include: {
      stack: true, // Include stack information to check for CommunityAsk
      deckQuestions: {
        include: {
          question: {
            include: {
              questionOptions: {
                orderBy: {
                  index: "asc",
                },
                include: {
                  questionAnswers: {
                    where: {
                      userId,
                    },
                  },
                },
              },
              questionTags: {
                include: {
                  tag: true,
                },
              },
              // Include user and wallet data for authors functionality
              user: {
                include: {
                  wallets: true,
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
            orderBy: {
              index: "asc",
            },
            include: {
              questionAnswers: true,
            },
          },
        },
      },
    },
  });

  const totalDeckQuestions = getTotalNumberOfDeckQuestions(deckQuestions);

  const creditCostUnansweredQuestion = await prisma.deckQuestion.findMany({
    where: {
      deckId: deckId,
      question: {
        questionOptions: {
          every: {
            questionAnswers: {
              none: {
                userId: userId,
              },
            },
          },
        },
      },
    },
    select: {
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

  const deckCreditCost = creditCostUnansweredQuestion.every(
    (dq) => dq?.question?.creditCostPerQuestion == null,
  )
    ? null
    : creditCostUnansweredQuestion.reduce((total, dq) => {
        return total + (dq?.question?.creditCostPerQuestion || 0);
      }, 0);

  const deckRewardAmount = creditCostUnansweredQuestion.reduce((total, dq) => {
    return total + (dq?.question?.revealTokenAmount || 0);
  }, 0);

  // if deck will be active in the future, return the deck
  if (!!deck.activeFromDate && isAfter(deck.activeFromDate, new Date())) {
    return {
      questions: mapQuestionFromDeck(deck),
      id: deck.id,
      date: deck.date,
      stackId: deck.stackId,
      name: deck.deck,
      totalDeckQuestions,
      revealAtDate: deck.revealAtDate,
      activeFromDate: deck.activeFromDate,
      deckCreditCost,
      deckRewardAmount,
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
      deckRewardAmount,
      deckInfo: {
        heading: deck.heading || deck.deck,
        description: deck.description,
        imageUrl: deck.imageUrl,
        footer: deck.footer,
        author: deck.author,
        authorImageUrl: deck.authorImageUrl,
      },
      activeFromDate: deck.activeFromDate,
    };
  }

  // Use new mapping function that handles authors
  const questions = mapQuestionFromDeckWithAuthors(deck);

  // Collect all unique authors from all questions in the deck (deck-level authors)
  const isCommunityAsk = deck.stack?.specialId === "CommunityAsk";
  let deckAuthors: Array<QuestionAuthor> = [];

  if (isCommunityAsk) {
    const authorsMap = new Map<string, QuestionAuthor>();
    
    deck.deckQuestions.forEach((dq) => {
      if (dq.question.user && dq.question.user.wallets && dq.question.user.wallets.length > 0) {
        const user = dq.question.user;
        const authorKey = user.wallets[0].address; // Use wallet address as unique key
        
        if (!authorsMap.has(authorKey)) {
          authorsMap.set(authorKey, {
            address: user.wallets[0].address,
            username: user.username || undefined,
            avatarUrl: user.profileSrc || undefined,
          });
        }
      }
    });
    
    deckAuthors = Array.from(authorsMap.values());
  }

  return {
    questions,
    id: deck.id,
    date: deck.date,
    stackId: deck.stackId,
    deckCreditCost,
    deckRewardAmount,
    numberOfUserAnswers: deck.deckQuestions.flatMap((dq) =>
      dq.question.questionOptions.flatMap((qo) => qo.questionAnswers),
    ).length,
    authors: deckAuthors, // Add authors at deck level
    deckInfo: {
      heading: deck.heading || deck.deck,
      description: deck.description,
      imageUrl: deck.imageUrl,
      footer: deck.footer,
      author: deck.author,
      authorImageUrl: deck.authorImageUrl,
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
    status: dq.question.questionOptions[0]?.questionAnswers?.[0]?.status,
    createdAt: dq.question.questionOptions[0]?.questionAnswers?.[0]?.createdAt,
  }));

  return questions;
};

// New mapping function that handles authors for CommunityAsk stacks
const mapQuestionFromDeckWithAuthors = (
  deck: Deck & {
    stack?: { specialId?: string | null } | null;
    deckQuestions: Array<
      DeckQuestion & {
        question: Question & {
          questionOptions: (QuestionOption & {
            questionAnswers?: QuestionAnswer[];
          })[];
          questionTags: (QuestionTag & { tag: Tag })[];
          user?: {
            id: string;
            username?: string | null;
            profileSrc?: string | null;
            wallets: { address: string }[];
          } | null;
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
    status: dq.question.questionOptions[0]?.questionAnswers?.[0]?.status,
    createdAt: dq.question.questionOptions[0]?.questionAnswers?.[0]?.createdAt,
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
              questionOptions: {
                orderBy: {
                  index: "asc",
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
