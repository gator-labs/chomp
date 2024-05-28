import {
  Deck,
  DeckQuestion,
  Prisma,
  Question,
  QuestionOption,
  QuestionTag,
  Tag,
} from "@prisma/client";
import dayjs from "dayjs";
import { z } from "zod";
import { addPlaceholderAnswers } from "../actions/answer";
import { getJwtPayload } from "../actions/jwt";
import { HistorySortOptions } from "../api/history/route";
import { questionSchema } from "../schemas/question";
import prisma from "../services/prisma";
import {
  handleQuestionMappingForFeed,
  populateAnswerCount,
} from "../utils/question";
import { answerPercentageQuery } from "./answerPercentageQuery";
import { getHomeFeedDecks } from "./deck";

export enum ElementType {
  Question = "Question",
  Deck = "Deck",
}

export async function getQuestionForAnswerById(questionId: number) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const question = await prisma.question.findFirst({
    where: { id: { equals: questionId } },
    include: {
      deckQuestions: { include: { deck: true } },
      questionOptions: true,
      questionTags: {
        include: {
          tag: true,
        },
      },
    },
  });
  if (!question) {
    return null;
  }

  const mappedQuestion = mapToViewModelQuestion(question);
  await addPlaceholderAnswers(question.questionOptions, payload.sub);
  return mappedQuestion;
}

const mapToViewModelQuestion = (
  question: Question & {
    questionOptions: QuestionOption[];
    questionTags: (QuestionTag & { tag: Tag })[];
    deckQuestions: Array<DeckQuestion & { deck: Deck }>;
  },
) => ({
  id: question.id,
  durationMiliseconds: Number(question.durationMiliseconds) ?? 0,
  question: question.question,
  questionOptions: question.questionOptions.map((qo) => ({
    id: qo.id,
    option: qo.option,
    isLeft: qo.isLeft,
  })),
  questionTags: question.questionTags,
  type: question.type,
  imageUrl: question.imageUrl ?? undefined,
  revealAtDate: question.revealAtDate
    ? question.revealAtDate
    : question.deckQuestions.length > 0
      ? question.deckQuestions[0].deck.revealAtDate
      : null,
});

export async function getQuestions() {
  const questions = await prisma.question.findMany({
    where: {
      deckQuestions: { none: {} },
    },
    include: {
      questionTags: {
        include: {
          tag: true,
        },
      },
    },
  });

  return questions;
}

export async function getQuestion(id: number) {
  const question = await prisma.question.findUnique({
    where: {
      id,
    },
    include: {
      questionOptions: {
        include: {
          questionAnswers: true,
        },
      },
    },
  });

  return question;
}
export async function getQuestionSchema(
  id: number,
): Promise<z.infer<typeof questionSchema> | null> {
  const question = await prisma.question.findUnique({
    where: {
      id,
    },
    include: {
      questionOptions: true,
      questionTags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!question) {
    return null;
  }

  const questionData = {
    ...question,
    questionTags: undefined,
    tagIds: question?.questionTags.map((qt) => qt.tagId) || [],
  };

  return questionData;
}

export async function getHistory(
  query: string = "",
  sort: HistorySortOptions = HistorySortOptions.Revealed,
) {
  const promiseArray = [
    getHomeFeedQuestions({
      areAnswered: true,
      areRevealed: false,
      query,
      sort,
    }),
    getHomeFeedDecks({ areAnswered: true, areRevealed: false, query, sort }),
    getHomeFeedQuestions({ areAnswered: true, areRevealed: true, query, sort }),
    getHomeFeedDecks({ areAnswered: true, areRevealed: true, query, sort }),
  ];

  const [
    answeredUnrevealedQuestions,
    answeredUnrevealedDecks,
    answeredRevealedQuestions,
    answeredRevealedDecks,
  ] = await Promise.all(promiseArray);

  let response = [
    ...answeredUnrevealedQuestions.map((e) => ({
      ...e,
      elementType: ElementType[ElementType.Question],
    })),
    ...answeredUnrevealedDecks.map((e) => ({
      ...e,
      elementType: ElementType[ElementType.Deck],
    })),
    ...answeredRevealedQuestions.map((e) => ({
      ...e,
      elementType: ElementType[ElementType.Question],
    })),
    ...answeredRevealedDecks.map((e) => ({
      ...e,
      elementType: ElementType[ElementType.Deck],
    })),
  ];

  if (sort === HistorySortOptions.Date) {
    response.sort((a: any, b: any) => {
      if (dayjs(a.answerDate).isAfter(b.answerDate)) {
        return -1;
      }

      if (dayjs(b.answerDate).isAfter(a.answerDate)) {
        return 1;
      }

      return 0;
    });
  }

  if (sort === HistorySortOptions.Revealed) {
    response.sort((a, b) => {
      if (dayjs(a.revealAtDate).isAfter(b.revealAtDate)) {
        return 1;
      }

      if (dayjs(b.revealAtDate).isAfter(a.revealAtDate)) {
        return -1;
      }

      return 0;
    });
  }

  if (sort === HistorySortOptions.Claimable) {
    response.sort((a, b) => {
      if (a.chompResults.length > 0 && b.chompResults.length > 0) {
        const aNewestClaimTime = a.chompResults[0]?.createdAt;
        const bNewestClaimTime = b.chompResults[0]?.createdAt;

        if (dayjs(aNewestClaimTime).isAfter(bNewestClaimTime)) {
          return -1;
        }

        if (dayjs(bNewestClaimTime).isAfter(aNewestClaimTime)) {
          return 1;
        }

        return 0;
      }

      if (a.chompResults.length > 0) {
        return -1;
      }

      if (b.chompResults.length > 0) {
        return 1;
      }

      return 0;
    });
  }

  return response;
}

export async function getUnansweredDailyQuestions(query = "") {
  const payload = await getJwtPayload();

  if (!payload) {
    return [];
  }

  const dailyDeckQuestions = await prisma.deckQuestion.findMany({
    where: {
      deck: {
        date: {
          gte: dayjs(new Date()).add(-3, "days").toDate(),
          lte: dayjs(new Date()).endOf("day").toDate(),
        },
        revealAtDate: { gte: new Date() },
      },
      question: {
        question: { contains: query, mode: "insensitive" },
        questionOptions: {
          none: {
            questionAnswers: {
              some: {
                userId: payload.sub,
              },
            },
          },
        },
        OR: [{ revealAtDate: { gte: new Date() } }, { revealAtDate: null }],
      },
    },
    include: {
      question: true,
    },
    orderBy: {
      deck: { date: "desc" },
    },
  });

  return dailyDeckQuestions.map((dq) => dq.question);
}

export async function getFirstUnansweredQuestion() {
  const questions = await getUnansweredDailyQuestions();

  if (questions.length === 0) {
    return null;
  }

  return questions[0];
}

export async function getHomeFeedQuestions({
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

  let sortInput: Prisma.QuestionOrderByWithRelationInput = {
    revealAtDate: { sort: "desc" },
  };

  if (sort === HistorySortOptions.Claimable) {
    sortInput = {
      chompResults: { _count: "desc" },
    };
  }

  if (sort === HistorySortOptions.Revealed) {
    sortInput = {
      revealAtDate: { sort: "desc" },
    };
  }

  const revealedAtFilter: Prisma.QuestionWhereInput = areRevealed
    ? {
        chompResults: {
          some: {
            userId: {
              equals: payload.sub,
            },
          },
        },
      }
    : {
        chompResults: {
          none: {
            userId: {
              equals: payload.sub,
            },
          },
        },
      };

  const areAnsweredFilter: Prisma.QuestionWhereInput = areAnswered
    ? {
        questionOptions: {
          some: {
            AND: [
              {
                questionAnswers: {
                  some: {
                    userId: payload.sub,
                  },
                },
              },
              {
                questionAnswers: {
                  none: {
                    hasViewedButNotSubmitted: true,
                  },
                },
              },
            ],
          },
        },
      }
    : {
        questionOptions: {
          none: {
            questionAnswers: {
              some: {
                userId: payload.sub,
              },
            },
          },
        },
        OR: [{ revealAtDate: { gte: new Date() } }, { revealAtDate: null }],
      };

  const questionInclude: Prisma.QuestionInclude = areAnswered
    ? {
        questionOptions: {
          include: {
            questionAnswers: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
        chompResults: {
          where: {
            userId: { equals: payload.sub },
          },
          orderBy: { createdAt: "desc" },
        },
      }
    : {
        chompResults: {
          where: { userId: { equals: payload.sub } },
          orderBy: { createdAt: "desc" },
        },
      };

  let questions = await prisma.question.findMany({
    where: {
      question: { contains: query, mode: "insensitive" },
      // this AND is hack because we already have OR in areAnsweredFilter
      AND: [
        {
          OR: [
            {
              deckQuestions: {
                none: {},
              },
            },
            {
              deckQuestions: {
                some: {
                  deck: {
                    date: {
                      not: null,
                    },
                  },
                },
              },
            },
          ],
        },
      ],
      ...areAnsweredFilter,
      ...revealedAtFilter,
    },
    include: questionInclude,
    orderBy: { ...sortInput },
  });

  const questionOptionIds = questions.flatMap((q) =>
    q.questionOptions?.map((qo) => qo.id),
  );
  const questionOptionPercentages =
    await answerPercentageQuery(questionOptionIds);

  if (areAnswered) {
    questions = questions.map((q) => {
      const answerDate = q.questionOptions
        .map((qo: any) => qo.questionAnswers[0].createdAt)
        .sort((left: Date, right: Date) => {
          if (dayjs(left).isAfter(right)) {
            return 1;
          }

          if (dayjs(right).isAfter(left)) {
            return -1;
          }

          return 0;
        })[0];

      return { ...q, answerDate };
    });
  }

  if (sort === HistorySortOptions.Date) {
    questions.sort((a: any, b: any) => {
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

  questions.forEach((q) => populateAnswerCount(q as any));

  handleQuestionMappingForFeed(
    questions as any,
    questionOptionPercentages,
    payload.sub,
    areRevealed,
  );

  return questions;
}

export async function hasAnsweredQuestion(
  questionId: number,
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
        questionId: { equals: questionId },
      },
      ...questionAnswerWhereInput,
    },
  });

  return answeredCount > 0;
}
