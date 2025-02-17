// TODO: 1. Write a test to check if what will be the result if we exclude the bots in binary question
// 2. Write a test to check if what will be the result if we exclude the bots in multiple choice question
import { deleteDeck } from "@/app/actions/deck/deck";
import prisma from "@/app/services/prisma";
import { calculateCorrectAnswer } from "@/app/utils/algo";
import { generateUsers } from "@/scripts/utils";
import { EThreatLevelType } from "@/types/bots";
import { QuestionType } from "@prisma/client";

jest.mock("next/headers", () => ({
  headers: jest.fn(() => ({
    get: jest.fn((key) => {
      if (key === "x-path") return "/some-path";
      return null;
    }),
  })),
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("calculateCorrectAnswe", () => {
  let userIds: string[];
  let deckIds: number[];
  beforeAll(async () => {
    // Create users
    const users = await generateUsers(6);
    await prisma.user.createMany({
      data: users,
    });

    userIds = users.map((user) => user.id);

    // create decks and questions
    const decksData = [
      {
        data: {
          deck: `Premium Deck ${new Date().getTime()}`,
          revealAtDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          activeFromDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          deckQuestions: {
            create: {
              question: {
                create: {
                  stackId: null,
                  question: "Question 1",
                  type: QuestionType.BinaryQuestion,
                  revealTokenAmount: 10,
                  revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                  durationMiliseconds: BigInt(60000),
                  creditCostPerQuestion: 1,
                  questionOptions: {
                    create: [
                      {
                        option: "A",
                        isCorrect: false,
                        isLeft: false,
                      },
                      {
                        option: "B",
                        isCorrect: false,
                        isLeft: false,
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        data: {
          deck: `Premium Deck ${new Date().getTime()}`,
          revealAtDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          activeFromDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          deckQuestions: {
            create: {
              question: {
                create: {
                  stackId: null,
                  question: "Question 4",
                  type: QuestionType.MultiChoice,
                  revealTokenAmount: 10,
                  revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                  durationMiliseconds: BigInt(60000),
                  creditCostPerQuestion: 1,
                  questionOptions: {
                    create: [
                      {
                        option: "C",
                        isCorrect: false,
                        isLeft: false,
                      },
                      {
                        option: "D",
                        isCorrect: false,
                        isLeft: false,
                      },
                      {
                        option: "E",
                        isCorrect: false,
                        isLeft: false,
                      },
                      {
                        option: "F",
                        isCorrect: false,
                        isLeft: false,
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    ];

    const decks = [];

    for (let i = 0; i < decksData.length; i++) {
      const deck = await prisma.deck.create({
        data: decksData[i].data,
        include: {
          deckQuestions: true,
        },
      });
      decks.push(deck);
    }

    deckIds = decks.map((deck) => deck.id);

    // Create question answers for binary question
    const questionOptions = await prisma.questionOption.findMany({
      where: {
        question: {
          deckQuestions: {
            some: {
              deckId: deckIds[0],
            },
          },
        },
      },
    });

    await Promise.all(
      users.map(async (user) => {
        const selectedOption = questionOptions[Math.floor(Math.random() * 2)];
        const secondOrderOption =
          questionOptions[Math.floor(Math.random() * 2)];

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

    // Create question answers for multiple choice question
    const questionOptions1 = await prisma.questionOption.findMany({
      where: {
        question: {
          deckQuestions: {
            some: {
              deckId: deckIds[1],
            },
          },
        },
      },
    });

    await Promise.all(
      users.map(async (user) => {
        const selectedOption = questionOptions1[Math.floor(Math.random() * 4)];
        const secondOrderOption =
          questionOptions1[Math.floor(Math.random() * 4)];

        await Promise.all(
          questionOptions1.map(async (option) => {
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
  });

  afterAll(async () => {
    const deletePromises = deckIds.map((deckId) => deleteDeck(deckId));
    await Promise.all(deletePromises);

    await prisma.user.deleteMany({
      where: {
        id: { in: userIds },
      },
    });
  });
  it("should compare binary question reslut for bots and non-bots user response", async () => {
    await calculateCorrectAnswer([deckIds[0]]);

    const questionOptionsBeforeMarkedBot = await prisma.questionOption.findMany(
      {
        where: {
          question: {
            deckQuestions: {
              some: {
                deckId: deckIds[0],
              },
            },
          },
        },
        include: {
          questionAnswers: true,
        },
      },
    );
    await prisma.user.updateMany({
      where: {
        id: {
          in: [userIds[0], userIds[1]],
        },
      },
      data: {
        threatLevel: EThreatLevelType.ManualBlock,
      },
    });
    await calculateCorrectAnswer([deckIds[0]]);
    const questionOptionsAfterMarkedBot = await prisma.questionOption.findMany({
      where: {
        question: {
          deckQuestions: {
            some: {
              deckId: deckIds[0],
            },
          },
        },
      },
      include: {
        questionAnswers: true,
      },
    });

    // Loop through each option in the arrays and compare the calculated values
    questionOptionsBeforeMarkedBot.forEach((optionBefore, index) => {
      const optionAfter = questionOptionsAfterMarkedBot[index];

      // Compare calculatedAveragePercentage
      expect(optionBefore.calculatedAveragePercentage).not.toContainEqual(
        optionAfter.calculatedAveragePercentage,
      );
    });
  });
  it("should compare multiple choice question reslut for bots and non-bots user response", async () => {
    await calculateCorrectAnswer([deckIds[1]]);

    const questionOptionsAfterMarkedBot = await prisma.questionOption.findMany({
      where: {
        question: {
          deckQuestions: {
            some: {
              deckId: deckIds[1],
            },
          },
        },
      },
      include: {
        questionAnswers: true,
      },
    });

    await prisma.user.updateMany({
      where: {
        id: {
          in: [userIds[0], userIds[1]],
        },
      },
      data: {
        threatLevel: EThreatLevelType.ManualAllow,
      },
    });
    await calculateCorrectAnswer([deckIds[1]]);

    const questionOptionsBeforeMarkedBot = await prisma.questionOption.findMany(
      {
        where: {
          question: {
            deckQuestions: {
              some: {
                deckId: deckIds[0],
              },
            },
          },
        },
        include: {
          questionAnswers: true,
        },
      },
    );
    // Loop through each option in the arrays and compare the calculated values
    questionOptionsBeforeMarkedBot.forEach((optionBefore, index) => {
      const optionAfter = questionOptionsAfterMarkedBot[index];

      // Compare calculatedAveragePercentage
      expect(optionBefore.calculatedAveragePercentage).not.toContainEqual(
        optionAfter.calculatedAveragePercentage,
      );
    });
  });
});
