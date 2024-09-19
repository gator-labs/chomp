import {
  AnswerStatus,
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
import { getJwtPayload } from "../actions/jwt";
import { questionSchema } from "../schemas/question";
import prisma from "../services/prisma";
import {
  isEntityRevealable,
  mapPercentages,
  populateAnswerCount,
} from "../utils/question";
import { answerPercentageQuery } from "./answerPercentageQuery";

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
    ignorePlaceholder ? { status: AnswerStatus.Submitted } : {};

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

export async function getQuestionWithUserAnswer(questionId: number) {
  const payload = await getJwtPayload();
  const userId = payload?.sub ?? "";
  if (!userId) {
    return;
  }
  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
    include: {
      questionOptions: {
        include: {
          questionAnswers: {
            where: {
              userId: userId,
            },
          },
        },
      },
      chompResults: {
        where: {
          userId,
        },
      },
    },
  });

  if (!question) {
    return null;
  }

  const questionOptionIds = question.questionOptions.map((qo) => qo.id);
  const questionOptionPercentages =
    await answerPercentageQuery(questionOptionIds);

  const populated = populateAnswerCount(question);

  mapPercentages([question] as any, questionOptionPercentages);

  const userAnswers = question.questionOptions
    .flatMap((option) =>
      option.questionAnswers.map((answer) => ({
        ...answer,
        questionOption: {
          id: option.id,
          option: option.option,
          isLeft: option.isLeft,
          createdAt: option.createdAt,
          updatedAt: option.updatedAt,
          questionId: option.questionId,
        },
      })),
    )
    .filter((answer) => answer.userId === userId);

  let correctAnswer = question.questionOptions.find(
    (option) => option.isCorrect,
  );

  if (!correctAnswer) {
    correctAnswer = question.questionOptions.find(
      (option) => option.calculatedIsCorrect,
    );
  }

  const isQuestionRevealable = isEntityRevealable({
    revealAtAnswerCount: question.revealAtAnswerCount,
    revealAtDate: question.revealAtDate,
    answerCount: question.questionOptions[0].questionAnswers.length,
  });

  return {
    ...question,
    chompResults: question.chompResults.map((chompResult) => ({
      ...chompResult,
      rewardTokenAmount: chompResult.rewardTokenAmount?.toNumber(),
    })),
    userAnswers: userAnswers || null,
    answerCount: populated.answerCount ?? 0,
    correctAnswer,
    questionOptionPercentages: questionOptionPercentages.map((qop) => ({
      ...qop,
      ...question.questionOptions.find((qo) => qo.id === qop.id),
    })),
    isQuestionRevealable,
  };
}

export async function getQuestionRewards(
  questionId: number,
  burnTxId: string,
  userId: string,
) {
  const rewards = await prisma.chompResult.findMany({
    where: {
      AND: [
        {
          userId: userId,
          burnTransactionSignature: burnTxId,
          questionId,
        },
      ],
    },
    include: {
      question: {
        include: {
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
      user: true,
    },
  });

  if (!rewards.length) return [];

  return rewards.map((reward) => {
    let correctAnswer = reward!.question!.questionOptions.find(
      (option) => option.isCorrect,
    );

    if (!correctAnswer) {
      correctAnswer = reward!.question!.questionOptions.find(
        (option) => option.calculatedIsCorrect,
      );
    }

    const userAnswers = reward!
      .question!.questionOptions.flatMap((option) =>
        option.questionAnswers.map((answer) => ({
          ...answer,
          questionOption: {
            id: option.id,
            option: option.option,
            isLeft: option.isLeft,
            createdAt: option.createdAt,
            updatedAt: option.updatedAt,
            questionId: option.questionId,
          },
        })),
      )
      .filter((answer) => answer.userId === userId);

    return { ...reward, correctAnswer, userAnswers };
  });
}
