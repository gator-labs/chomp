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
): Promise<{ deckLink: string }> {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const currentDate = new Date();

  // Create deck with dynamic values
  const deck = await prisma.deck.create({
    data: {
      deck: `${tag}: Deck ${format(currentDate, "MM/dd/yyyy")}`,
      revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      activeFromDate: new Date(),
      deckQuestions: {
        create: {
          question: {
            create: {
              question: `${tag}: Lorem ipsum?`,
              type: QuestionType.BinaryQuestion,
              revealToken: Token.Bonk,
              revealTokenAmount: 10,
              revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
              durationMiliseconds: BigInt(60000),
              questionOptions: {
                create: [
                  {
                    option: "A",
                    isCorrect: correctOption === "A",
                    isLeft: true,
                  },
                  {
                    option: "B",
                    isCorrect: correctOption === "B",
                    isLeft: false,
                  },
                ],
              },
            },
          },
        },
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
  });

  await Promise.all(
    users.map(async (user) => {
      const selectedOption = questionOptions[Math.floor(Math.random() * 2)];
      const secondOrderOption = questionOptions[Math.floor(Math.random() * 2)];

      await Promise.all(
        questionOptions.map(async (option) => {
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

  return {
    deckLink: "/application/decks/" + deck.id,
  };
}

export async function generateMultipleChoiceTestQuestion(
  correctOption: string,
  tag: string,
): Promise<{ deckLink: string }> {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const currentDate = new Date();

  const deck = await prisma.deck.create({
    data: {
      deck: `${tag}: Deck ${format(currentDate, "MM/dd/yyyy")}`,
      revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      activeFromDate: new Date(),
      deckQuestions: {
        create: {
          question: {
            create: {
              question: tag + ": Lorem ipsum?",
              type: QuestionType.MultiChoice,
              revealToken: Token.Bonk,
              revealTokenAmount: 10,
              revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
              durationMiliseconds: BigInt(60000),
              questionOptions: {
                create: [
                  {
                    option: "A",
                    isCorrect: correctOption === "A",
                    isLeft: false,
                  },
                  {
                    option: "B",
                    isCorrect: correctOption === "B",
                    isLeft: false,
                  },
                  {
                    option: "C",
                    isCorrect: correctOption === "C",
                    isLeft: false,
                  },
                  {
                    option: "D",
                    isCorrect: correctOption === "D",
                    isLeft: false,
                  },
                ],
              },
            },
          },
        },
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
  });

  await Promise.all(
    users.map(async (user) => {
      const selectedOption = questionOptions[Math.floor(Math.random() * 4)];
      const secondOrderOption = questionOptions[Math.floor(Math.random() * 4)];

      await Promise.all(
        questionOptions.map(async (option) => {
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

  return {
    deckLink: "/application/decks/" + deck.id,
  };
}
