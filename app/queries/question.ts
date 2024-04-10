import { z } from "zod";
import prisma from "../services/prisma";
import { questionSchema } from "../schemas/question";
import {
  Prisma,
  Question,
  QuestionOption,
  QuestionTag,
  Tag,
} from "@prisma/client";
import { getJwtPayload } from "../actions/jwt";
import { getHomeFeedDecks } from "./deck";
import { answerPercentageQuery } from "./answerPercentageQuery";

export async function getQuestionForAnswerById(questionId: number) {
  const question = await prisma.question.findFirst({
    where: { id: { equals: questionId } },
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

  return mapToViewModelQuestion(question);
}

const mapToViewModelQuestion = (
  question: Question & {
    questionOptions: QuestionOption[];
    questionTags: (QuestionTag & { tag: Tag })[];
  }
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
});

export async function getQuestions() {
  const questions = await prisma.question.findMany({
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
  id: number
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

  const [
    unansweredDailyQuestions,
    unansweredUnrevealedQuestions,
    unansweredUnrevealedDecks,
    answeredUnrevealedQuestions,
    answeredUnrevealedDecks,
    answeredRevealedQuestions,
    answeredRevealedDecks,
  ] = await Promise.all(promiseArray);

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
      },
      question: {
        question: { contains: query },
        questionOptions: {
          none: {
            questionAnswer: {
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
}: {
  areAnswered: boolean;
  areRevealed: boolean;
  query: string;
}) {
  const payload = await getJwtPayload();

  if (!payload) {
    return [];
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
            questionAnswer: {
              some: {
                userId: payload.sub,
              },
            },
          },
        },
      }
    : {
        questionOptions: {
          none: {
            questionAnswer: {
              some: {
                userId: payload.sub,
              },
            },
          },
        },
      };

  const questionInclude: Prisma.QuestionInclude = areAnswered
    ? {
        questionOptions: {
          include: {
            questionAnswer: { where: { userId: { equals: payload.sub } } },
          },
        },
      }
    : {};

  const questions = await prisma.question.findMany({
    where: {
      question: { contains: query },
      deckQuestions: { none: { deck: { date: null } } },
      ...areAnsweredFilter,
      ...revealedAtFilter,
    },
    include: questionInclude,
    orderBy: { revealAtDate: { sort: "desc" } },
  });

  const questionOptionIds = questions.flatMap((q) =>
    q.questionOptions?.map((qo) => qo.id)
  );
  const questionOptionPercentages =
    await answerPercentageQuery(questionOptionIds);

  questions.forEach((q) => {
    q.questionOptions?.forEach((qo: any) => {
      qo.questionAnswer?.forEach((qa: any) => {
        qa.percentageResult =
          questionOptionPercentages.find(
            (qop) => qop.id === qa.questionOptionId
          )?.percentageResult ?? 0;
      });
    });
  });

  return questions;
}
