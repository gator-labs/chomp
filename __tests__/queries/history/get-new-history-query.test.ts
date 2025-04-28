import { deleteDeck } from "@/app/actions/deck/deck";
import {
  getHistoryHeadersData,
  getNewHistoryQuery,
} from "@/app/queries/history";
import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";
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

describe("getNewHistoryQuery", () => {
  let userIds: string[];

  let questionOptionIds: number[];

  let deckId: number;
  let questionId: number;

  beforeAll(async () => {
    // Create users
    const users = await generateUsers(6);

    await prisma.user.createMany({
      data: users,
    });

    userIds = users.map((user) => user.id);

    const deck = await prisma.deck.create({
      data: {
        deck: `Premium Deck ${new Date().getTime()}`,
        revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
                      index: 0,
                    },
                    {
                      option: "B",
                      isCorrect: false,
                      isLeft: false,
                      index: 1,
                    },
                  ],
                },
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

    questionId = deck?.deckQuestions[0].question.id;

    questionOptionIds = deck.deckQuestions[0].question.questionOptions.map(
      (qo) => qo.id,
    );

    deckId = deck?.id;

    // Create question answers for binary question
    const questionOptions = await prisma.questionOption.findMany({
      where: {
        question: {
          deckQuestions: {
            some: {
              deckId: deckId,
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
  });

  afterAll(async () => {
    await deleteDeck(deckId);

    await prisma.user.deleteMany({
      where: {
        id: { in: userIds },
      },
    });
  });

  it("should return unanswered indicator type", async () => {
    await prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        revealAtDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    });
    const result = await getNewHistoryQuery("mock-id", 1, 1);

    expect(result).toBeDefined();
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: questionId,
        indicatorType: "unseen",
      }),
    );

    const counts = await getHistoryHeadersData("mock-id", deckId);

    expect(counts).toEqual(
      expect.objectContaining({
        correctCount: 0,
        incorrectCount: 0,
        unansweredCount: 0,
        unrevealedCount: 0,
        unseenCount: 1,
        incompleteCount: 0,
      }),
    );
  });

  it("should return correct indicator type", async () => {
    await prisma.questionOption.update({
      where: {
        id: questionOptionIds[0],
      },
      data: {
        calculatedIsCorrect: true,
      },
    });

    await prisma.questionOption.update({
      where: {
        id: questionOptionIds[1],
      },
      data: {
        calculatedIsCorrect: false,
      },
    });

    const answer = await prisma.questionAnswer.findFirstOrThrow({
      where: {
        questionOptionId: questionOptionIds[0],
        selected: true,
      },
    });

    const result = await getNewHistoryQuery(answer?.userId, 1, 1);

    expect(result).toBeDefined();
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: questionId,
        indicatorType: "correct",
      }),
    );

    const counts = await getHistoryHeadersData(answer?.userId, deckId);

    expect(counts).toEqual(
      expect.objectContaining({
        correctCount: 1,
        incorrectCount: 0,
        unansweredCount: 0,
        unrevealedCount: 0,
        unseenCount: 0,
        incompleteCount: 0,
      }),
    );
  });

  it("should return incorrect indicator type", async () => {
    const answer = await prisma.questionAnswer.findFirstOrThrow({
      where: {
        questionOptionId: questionOptionIds[0],
        selected: false,
      },
    });

    const result = await getNewHistoryQuery(answer?.userId, 1, 1);

    expect(result).toBeDefined();
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: questionId,
        indicatorType: "incorrect",
      }),
    );

    const counts = await getHistoryHeadersData(answer?.userId, deckId);

    expect(counts).toEqual(
      expect.objectContaining({
        correctCount: 0,
        incorrectCount: 1,
        unansweredCount: 0,
        unrevealedCount: 0,
        unseenCount: 0,
        incompleteCount: 0,
      }),
    );
  });

  it("should return incomplete indicator type", async () => {
    await prisma.questionAnswer.updateMany({
      where: {
        questionOption: {
          question: {
            id: questionId,
          },
        },
      },
      data: {
        percentage: null,
      },
    });

    const answer = await prisma.questionAnswer.findFirstOrThrow({
      where: {
        questionOptionId: questionOptionIds[0],
        selected: false,
      },
    });

    const result = await getNewHistoryQuery(answer?.userId, 1, 1);

    expect(result).toBeDefined();
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: questionId,
        indicatorType: "incomplete",
      }),
    );

    const counts = await getHistoryHeadersData(answer?.userId, deckId);

    expect(counts).toEqual(
      expect.objectContaining({
        correctCount: 0,
        incorrectCount: 0,
        unansweredCount: 0,
        unrevealedCount: 0,
        unseenCount: 0,
        incompleteCount: 1,
      }),
    );
  });

  it("should return incomplete indicator type", async () => {
    await prisma.questionAnswer.updateMany({
      where: {
        questionOption: {
          question: {
            id: questionId,
          },
        },
      },
      data: {
        selected: false,
      },
    });

    const answer = await prisma.questionAnswer.findFirstOrThrow({
      where: {
        questionOptionId: questionOptionIds[0],
        selected: false,
      },
    });

    const result = await getNewHistoryQuery(answer?.userId, 1, 1);

    expect(result).toBeDefined();
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: questionId,
        indicatorType: "unanswered",
      }),
    );

    const counts = await getHistoryHeadersData(answer?.userId, deckId);

    expect(counts).toEqual(
      expect.objectContaining({
        correctCount: 0,
        incorrectCount: 0,
        unansweredCount: 1,
        unrevealedCount: 0,
        unseenCount: 0,
        incompleteCount: 0,
      }),
    );
  });

  it("should return unseen indicator type", async () => {
    const userId = (
      await prisma.questionAnswer.findFirstOrThrow({
        where: {
          questionOptionId: questionOptionIds[0],
          selected: false,
        },
      })
    )?.userId;

    await prisma.questionAnswer.deleteMany({
      where: {
        questionOption: {
          question: {
            id: questionId,
          },
        },
      },
    });

    const result = await getNewHistoryQuery(userId, 1, 1);

    expect(result).toBeDefined();
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: questionId,
        indicatorType: "unseen",
      }),
    );

    const counts = await getHistoryHeadersData(userId, deckId);

    expect(counts).toEqual(
      expect.objectContaining({
        correctCount: 0,
        incorrectCount: 0,
        unansweredCount: 0,
        unrevealedCount: 0,
        unseenCount: 1,
        incompleteCount: 0,
      }),
    );
  });
});
