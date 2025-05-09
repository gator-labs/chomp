"use server";

import { getIsUserAdmin } from "@/app/queries/user";
import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";
import { QuestionType, Token } from "@prisma/client";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export async function generateBinaryTestQuestion(
  correctOption: string,
  tag: string,
  creditCostPerQuestion: number | null,
  questionCount: number,
): Promise<{ deckLink: string; deckId: number }> {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const currentDate = new Date();

  const questionTemplate = {
    question: `${tag}: Lorem ipsum?`,
    type: QuestionType.BinaryQuestion,
    revealToken: Token.Bonk,
    revealTokenAmount: 10,
    revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    durationMiliseconds: BigInt(60000),
    creditCostPerQuestion,
    questionOptions: {
      create: [
        {
          option: "A",
          isCorrect: correctOption === "A",
          isLeft: true,
          index: 0,
        },
        {
          option: "B",
          isCorrect: correctOption === "B",
          isLeft: false,
          index: 1,
        },
      ],
    },
  };

  const questions = Array(questionCount)
    .fill(questionTemplate)
    .map((q, i) => ({
      question: {
        create: {
          ...q,
          question: `${q.question} [Q ${i + 1}/${questionCount}]`,
        },
      },
    }));

  // Create deck with dynamic values
  const deck = await prisma.deck.create({
    data: {
      deck: `${tag}: Deck ${format(currentDate, "MM/dd/yyyy")}`,
      revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      activeFromDate: new Date(),
      creditCostPerQuestion,
      deckQuestions: {
        create: questions,
      },
    },
  });

  const users = await generateUsers(50);

  await prisma.user.createMany({
    data: users,
  });

  const questionOptions = await prisma.questionOption.findMany({
    where: {
      question: {
        deckQuestions: {
          some: {
            deckId: deck.id,
          },
        },
      },
    },
    include: {
      question: true,
    },
  });

  const questionIds = Array.from(
    new Set(questionOptions.map((qo) => qo.question.id)),
  );

  await Promise.all(
    users.map(async (user) => {
      await Promise.all(
        questionIds.map(async (qid) => {
          const options = questionOptions.filter((qo) => qo.questionId === qid);
          const selectedOption = options[Math.floor(Math.random() * 2)];
          const secondOrderOption = options[Math.floor(Math.random() * 2)];

          await Promise.all(
            options.map(async (option) => {
              const isSelectedOption = option.id === selectedOption.id;
              const percentage =
                secondOrderOption.id === option.id
                  ? Math.floor(Math.random() * 100)
                  : null;

              await prisma.questionAnswer.create({
                data: {
                  userId: user.id,
                  questionOptionId: option.id,
                  percentage: percentage,
                  selected: isSelectedOption,
                  timeToAnswer: BigInt(Math.floor(Math.random() * 60000)),
                },
              });
            }),
          );
        }),
      );
    }),
  );

  return {
    deckLink: "/application/decks/" + deck.id,
    deckId: deck.id,
  };
}

export async function generateMultipleChoiceTestQuestion(
  correctOption: string,
  tag: string,
  creditCostPerQuestion: number | null,
  questionCount: number,
): Promise<{ deckLink: string; deckId: number }> {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const currentDate = new Date();

  const questionTemplate = {
    question: tag + ": Lorem ipsum?",
    type: QuestionType.MultiChoice,
    revealToken: Token.Bonk,
    revealTokenAmount: 10,
    revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    durationMiliseconds: BigInt(60000),
    creditCostPerQuestion,
    questionOptions: {
      create: [
        {
          option: "A",
          isCorrect: correctOption === "A",
          isLeft: false,
          index: 0,
        },
        {
          option: "B",
          isCorrect: correctOption === "B",
          isLeft: false,
          index: 1,
        },
        {
          option: "C",
          isCorrect: correctOption === "C",
          isLeft: false,
          index: 2,
        },
        {
          option: "D",
          isCorrect: correctOption === "D",
          isLeft: false,
          index: 3,
        },
      ],
    },
  };

  const questions = Array(questionCount)
    .fill(questionTemplate)
    .map((q, i) => ({
      question: {
        create: {
          ...q,
          question: `${q.question} [Q ${i + 1}/${questionCount}]`,
        },
      },
    }));

  const deck = await prisma.deck.create({
    data: {
      deck: `${tag}: Deck ${format(currentDate, "MM/dd/yyyy")}`,
      revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      activeFromDate: new Date(),
      creditCostPerQuestion,
      deckQuestions: {
        create: questions,
      },
    },
  });

  const users = await generateUsers(50);

  await prisma.user.createMany({
    data: users,
  });

  const questionOptions = await prisma.questionOption.findMany({
    where: {
      question: {
        deckQuestions: {
          some: {
            deckId: deck.id,
          },
        },
      },
    },
    include: {
      question: true,
    },
  });

  const questionIds = Array.from(
    new Set(questionOptions.map((qo) => qo.question.id)),
  );

  await Promise.all(
    users.map(async (user) => {
      await Promise.all(
        questionIds.map(async (qid) => {
          const options = questionOptions.filter((qo) => qo.questionId === qid);
          const selectedOption = options[Math.floor(Math.random() * 4)];
          const secondOrderOption = options[Math.floor(Math.random() * 4)];

          await Promise.all(
            options.map(async (option) => {
              const isSelectedOption = option.id === selectedOption.id;
              const percentage =
                secondOrderOption.id === option.id
                  ? Math.floor(Math.random() * 100)
                  : null;

              await prisma.questionAnswer.create({
                data: {
                  userId: user.id,
                  questionOptionId: option.id,
                  percentage: percentage,
                  selected: isSelectedOption,
                  timeToAnswer: BigInt(Math.floor(Math.random() * 60000)),
                },
              });
            }),
          );
        }),
      );
    }),
  );

  return {
    deckLink: "/application/decks/" + deck.id,
    deckId: deck.id,
  };
}
