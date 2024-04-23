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
import dayjs from "dayjs";
import { redirect } from "next/navigation";
import { addPlaceholderAnswers } from "../actions/answer";
import { getJwtPayload } from "../actions/jwt";
import { HistorySortOptions } from "../api/history/route";
import prisma from "../services/prisma";
import {
  getDeckState,
  handleQuestionMappingForFeed,
  populateAnswerCount,
} from "../utils/question";
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
  // const currentDayStart = dayjs(new Date()).startOf("day").toDate();
  // const currentDayEnd = dayjs(new Date()).endOf("day").toDate();
  const payload = await getJwtPayload();
  if (!payload) {
    return redirect("/login");
  }

  const dailyDeck = await prisma.deck.findFirst({
    where: {
      date: { not: null /* gte: currentDayStart, lte: currentDayEnd */ },
      isActive: true,
      userDeck: { none: { userId: payload?.sub ?? "" } },
      // this should be just handled by currentDayStart and currentDayEnd
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
      reveals: {
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
              reveals: {
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
  const { isRevealable } = getDeckState(deck);
  handleQuestionMappingForFeed(
    questions as any,
    questionOptionPercentages,
    payload.sub,
    isRevealable,
  );

  return { ...deck, answerCount: populated.answerCount ?? 0 };
}

export async function getHomeFeedDecks({
  areAnswered,
  areRevealed,
  query,
  sort = HistorySortOptions.Revealed,
}: {
  areAnswered: boolean;
  areRevealed: boolean;
  query: string;
  sort?: HistorySortOptions;
}) {
  const payload = await getJwtPayload();

  if (!payload) {
    return [];
  }

  let sortInput: Prisma.DeckOrderByWithRelationInput = {
    revealAtDate: { sort: "desc" },
  };

  if (sort === HistorySortOptions.Claimable) {
    sortInput = {
      reveals: { _count: "desc" },
    };
  }

  if (sort === HistorySortOptions.Revealed) {
    sortInput = {
      revealAtDate: { sort: "desc" },
    };
  }

  const revealedAtFilter: Prisma.DeckWhereInput = areRevealed
    ? {
        reveals: {
          some: {
            userId: {
              equals: payload.sub,
            },
          },
        },
      }
    : {
        reveals: {
          none: {
            userId: {
              equals: payload.sub,
            },
          },
        },
      };

  const areAnsweredFilter: Prisma.DeckWhereInput = areAnswered
    ? {
        deckQuestions: {
          every: {
            question: {
              questionOptions: {
                some: {
                  questionAnswers: {
                    some: {
                      userId: payload.sub,
                      hasViewedButNotSubmitted: false,
                    },
                  },
                },
              },
            },
          },
        },
      }
    : {
        deckQuestions: {
          some: {
            question: {
              questionOptions: {
                none: {
                  questionAnswers: {
                    some: {
                      userId: payload.sub,
                      hasViewedButNotSubmitted: false,
                    },
                  },
                },
              },
            },
          },
        },
        OR: [{ revealAtDate: { gte: new Date() } }, { revealAtDate: null }],
        isActive: true,
      };

  let decks = await prisma.deck.findMany({
    where: {
      deck: { contains: query, mode: "insensitive" },
      date: {
        equals: null,
      },
      ...areAnsweredFilter,
      ...revealedAtFilter,
    },
    include: {
      deckQuestions: {
        include: {
          question: {
            include: {
              questionOptions: {
                include: {
                  questionAnswers: true,
                },
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
          },
        },
      },
      reveals: {
        where: { userId: { equals: payload.sub } },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { ...sortInput },
  });

  if (areAnswered) {
    decks = decks.map((d) => {
      const answerDate = d.deckQuestions
        .flatMap((dq) => dq.question.questionOptions)
        .map((qo) => qo.questionAnswers[0]?.createdAt)
        .filter((date) => !!date)
        .sort((left: Date, right: Date) => {
          if (dayjs(left).isAfter(right)) {
            return 1;
          }

          if (dayjs(right).isAfter(left)) {
            return -1;
          }

          return 0;
        })[0];

      return { ...d, answerDate };
    });
  }

  if (sort === HistorySortOptions.Date) {
    decks.sort((a: any, b: any) => {
      if (!areAnswered) {
        return 0;
      }

      if (dayjs(a.answerDate).isAfter(b.answerDate)) {
        return -1;
      }

      if (dayjs(b.answerDate).isAfter(a.answerDate)) {
        return 1;
      }

      return 0;
    });
  }

  decks.forEach((d) => populateAnswerCount(d as any));
  if (!areRevealed) {
    decks?.forEach((d) => {
      d.deckQuestions?.forEach((dq) => {
        dq.question?.questionOptions?.forEach((qo: { isTrue?: boolean }) => {
          delete qo.isTrue;
        });
      });
    });
  }

  decks.forEach((deck) =>
    deck.deckQuestions.forEach((dq) =>
      dq.question.questionOptions.forEach((qo: any) => {
        if (qo.questionAnswers) {
          qo.questionAnswers = qo.questionAnswers.filter(
            (qa: any) => qa.userId === payload.sub,
          );
        }
      }),
    ),
  );
  return decks;
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
      userId: { equals: userId },
      questionOption: {
        question: { deckQuestions: { some: { deckId: { equals: deckId } } } },
      },
      ...questionAnswerWhereInput,
    },
  });

  return answeredCount > 0;
}
