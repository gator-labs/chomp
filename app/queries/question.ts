import { z } from "zod";
import prisma from "../services/prisma";
import { questionSchema } from "../schemas/question";
import {
  Prisma,
  Question,
  QuestionAnswer,
  QuestionOption,
} from "@prisma/client";
import { getJwtPayload } from "../actions/jwt";

export async function getQuestionForAnswerById(questionId: number) {
  const question = await prisma.question.findFirst({
    where: { id: { equals: questionId } },
    include: {
      questionOptions: true,
    },
  });
  if (!question) {
    return null;
  }

  return mapToViewModelQuestion(question);
}

const mapToViewModelQuestion = (
  question: Question & { questionOptions: QuestionOption[] }
) => ({
  id: question.id,
  durationMiliseconds: Number(question.durationMiliseconds) ?? 0,
  question: question.question,
  questionOptions: question.questionOptions.map((qo) => ({
    id: qo.id,
    option: qo.option,
  })),
  type: question.type,
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

export async function getHomeFeed() {
  const promiseArray = [
    getUnansweredDailyQuestions(),
    getHomeFeedQuestions({ areAnswered: false, areRevealed: false }),
    getHomeFeedDecks({ areAnswered: false, areRevealed: false }),
    getHomeFeedQuestions({ areAnswered: true, areRevealed: false }),
    getHomeFeedDecks({ areAnswered: true, areRevealed: false }),
    getHomeFeedQuestions({ areAnswered: true, areRevealed: true }),
    getHomeFeedDecks({ areAnswered: true, areRevealed: true }),
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

export async function getUnansweredDailyQuestions() {
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
}: {
  areAnswered: boolean;
  areRevealed: boolean;
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
      deckQuestions: { none: {} },
      ...areAnsweredFilter,
      ...revealedAtFilter,
    },
    include: questionInclude,
  });

  const questionOptionIds = questions.flatMap((q) =>
    q.questionOptions?.map((qo) => qo.id)
  );
  const questionOptionPercentages: {
    questionOptionId: number;
    percentageResult: number | null;
  }[] =
    questionOptionIds.length === 0
      ? []
      : await prisma.$queryRaw`
          select 
            qa."questionOptionId",
            floor(
              (
                select 
                  count(*)
                from public."QuestionAnswer" subQa
                where subQa."questionOptionId" = qa."questionOptionId" 
              ) 
            /
              NULLIF(
                (
                  select 
                    count(*)
                  from public."QuestionAnswer" subQa
                  where subQa.selected = true and subQa."questionOptionId" = qa."questionOptionId"
                )
              , 0)
            ) * 100 as "percentageResult"
          from public."QuestionAnswer" qa
          where qa."questionOptionId" in (${Prisma.join(questionOptionIds)})
        `;

  questions.forEach((q) => {
    q.questionOptions?.forEach((qo: any) => {
      qo.questionAnswer?.forEach((qa: any) => {
        qa.percentageResult =
          questionOptionPercentages.find(
            (qop) => qop.questionOptionId === qa.questionOptionId
          )?.percentageResult ?? 0;
      });
    });
  });

  return questions;
}

export async function getHomeFeedDecks({
  areAnswered,
  areRevealed,
}: {
  areAnswered: boolean;
  areRevealed: boolean;
}) {
  const payload = await getJwtPayload();

  if (!payload) {
    return [];
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
          some: {
            question: {
              questionOptions: {
                some: {
                  questionAnswer: {
                    some: {
                      userId: payload.sub,
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
                  questionAnswer: {
                    some: {
                      userId: payload.sub,
                    },
                  },
                },
              },
            },
          },
        },
      };

  const decks = await prisma.deck.findMany({
    where: {
      date: {
        equals: null,
      },
      ...areAnsweredFilter,
      ...revealedAtFilter,
    },
  });

  return decks;
}
