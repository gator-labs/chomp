import { z } from "zod";
import prisma from "../services/prisma";
import { questionSchema } from "../schemas/question";
import {
  Deck,
  DeckQuestion,
  Prisma,
  Question,
  QuestionOption,
  QuestionTag,
  Tag,
} from "@prisma/client";
import { getJwtPayload } from "../actions/jwt";
import { getHomeFeedDecks } from "./deck";
import { answerPercentageQuery } from "./answerPercentageQuery";
import { HistorySortOptions } from "../api/history/route";
import dayjs from "dayjs";
import { addPlaceholderAnswers } from "../actions/answer";

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

export async function getHomeFeed(query: string = "") {
  const promiseArray = [
    getUnansweredDailyQuestions(query),
    getHomeFeedQuestions({ areAnswered: false, areRevealed: false, query }),
    getHomeFeedDecks({ areAnswered: false, areRevealed: false, query }),
    getHomeFeedQuestions({ areAnswered: true, areRevealed: false, query }),
    getHomeFeedDecks({ areAnswered: true, areRevealed: false, query }),
    getHomeFeedQuestions({ areAnswered: true, areRevealed: true, query }),
    getHomeFeedDecks({ areAnswered: true, areRevealed: true, query }),
  ];

  const sortRevealedComparerFn = (a: any, b: any) => {
    const aNewestClaimTime = a.reveals[0].createdAt;
    const bNewestClaimTime = b.reveals[0].createdAt;

    if (dayjs(aNewestClaimTime).isAfter(bNewestClaimTime)) {
      return 1;
    }

    if (dayjs(bNewestClaimTime).isAfter(aNewestClaimTime)) {
      return -1;
    }

    return 0;
  };
  const [
    unansweredDailyQuestions,
    unansweredUnrevealedQuestions,
    unansweredUnrevealedDecks,
    answeredUnrevealedQuestions,
    answeredUnrevealedDecks,
    answeredRevealedQuestions,
    answeredRevealedDecks,
  ] = await Promise.all(promiseArray);

  answeredRevealedQuestions.sort(sortRevealedComparerFn);
  answeredRevealedDecks.sort(sortRevealedComparerFn);

  return {
    unansweredDailyQuestions,
    unansweredUnrevealedQuestions,
    unansweredUnrevealedDecks,
    answeredUnrevealedQuestions,
    answeredUnrevealedDecks,
    answeredRevealedQuestions,
    answeredRevealedDecks,
  };
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
      if (a.reveals.length > 0 && b.reveals.length > 0) {
        const aNewestClaimTime = a.reveals[0].createdAt;
        const bNewestClaimTime = b.reveals[0].createdAt;

        if (dayjs(aNewestClaimTime).isAfter(bNewestClaimTime)) {
          return -1;
        }

        if (dayjs(bNewestClaimTime).isAfter(aNewestClaimTime)) {
          return 1;
        }

        return 0;
      }

      if (a.reveals.length > 0) {
        return -1;
      }

      if (b.reveals.length > 0) {
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
          not: null,
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
        OR: [{ revealAtDate: { lte: new Date() } }, { revealAtDate: null }],
      },
    },
    include: {
      question: true,
    },
  });

  return dailyDeckQuestions.map((dq) => dq.question);
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
      reveals: { _count: "desc" },
    };
  }

  if (sort === HistorySortOptions.Revealed) {
    sortInput = {
      revealAtDate: { sort: "desc" },
    };
  }

  const revealedAtFilter: Prisma.QuestionWhereInput = areRevealed
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
              where: { userId: { equals: payload.sub } },
              orderBy: { createdAt: "desc" },
            },
          },
        },
        reveals: {
          where: {
            userId: { equals: payload.sub },
          },
          orderBy: { createdAt: "desc" },
        },
      }
    : {
        reveals: {
          where: { userId: { equals: payload.sub } },
          orderBy: { createdAt: "desc" },
        },
      };

  let questions = await prisma.question.findMany({
    where: {
      question: { contains: query, mode: "insensitive" },
      deckQuestions: { none: {} },
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

  questions.forEach((q) => {
    q.questionOptions?.forEach((qo: any) => {
      qo.questionAnswers?.forEach((qa: any) => {
        qa.percentageResult =
          questionOptionPercentages.find(
            (qop) => qop.id === qa.questionOptionId,
          )?.percentageResult ?? 0;
      });
    });
  });

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
