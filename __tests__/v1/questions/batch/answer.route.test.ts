import prisma from "@/app/services/prisma";
import { POST } from "@/app/v1/questions/[id]/answer/batch/route";
import { QuestionType, Token } from "@prisma/client";
import bs58 from "bs58";
import dayjs from "dayjs";
import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { v4 as uuidv4 } from "uuid";

// Mock dependencies
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}));
jest.mock("mixpanel", () => {
  return {
    init: jest.fn(() => ({
      track: jest.fn(),
    })),
  };
});
jest.mock("@/app/queries/user", () => ({
  getCurrentUser: jest.fn(),
}));

const TEST_BACKEND_SECRET = "test-secret-for-answers-abc";

const generateWallet = () => {
  const keyBytes = crypto.randomBytes(32);
  return bs58.encode(keyBytes);
};

describe("API answer question", () => {
  process.env.BACKEND_SECRET = TEST_BACKEND_SECRET; // Set for all tests in this describe block

  const user1 = {
    id: uuidv4(),
    username: `user1`,
    wallet: generateWallet(),
  };

  const user2 = {
    id: uuidv4(),
    username: `user2`,
    wallet: generateWallet(),
  };

  const futureDate = dayjs().add(30, "day").toDate();
  const pastDate = dayjs().subtract(30, "day").toDate();

  let deckId: number;
  let questionIds: number[] = [];
  let questionUuids: string[] = [];
  let question1OptionUuids: string[] = [];

  beforeAll(async () => {
    await prisma.$transaction(async (tx) => {
      // Create deck
      const deck = await tx.deck.create({
        data: {
          deck: "Deck 1",
          date: new Date(),
          revealAtDate: futureDate,
          creditCostPerQuestion: 2,
        },
      });

      deckId = deck.id;

      // Create users
      await Promise.all([
        tx.user.create({ data: { id: user1.id } }),
        tx.wallet.create({ data: { userId: user1.id, address: user1.wallet } }),
        tx.user.create({ data: { id: user2.id } }),
        tx.wallet.create({ data: { userId: user2.id, address: user2.wallet } }),
      ]);

      // Create questions for decks
      const questions = await Promise.all([
        tx.question.create({
          data: {
            question: "Is the sky blue?",
            source: "crocodile",
            type: QuestionType.BinaryQuestion,
            activeFromDate: futureDate,
            revealToken: Token.Bonk,
            revealTokenAmount: 5000,
            creditCostPerQuestion: 2,
            questionOptions: {
              createMany: {
                data: [
                  {
                    option: "Yes",
                    isLeft: true,
                    calculatedIsCorrect: true,
                    calculatedPercentageOfSelectedAnswers: 90,
                    calculatedAveragePercentage: 70,
                    index: 0,
                  },
                  {
                    option: "No",
                    isLeft: false,
                    calculatedIsCorrect: false,
                    calculatedPercentageOfSelectedAnswers: 10,
                    calculatedAveragePercentage: 30,
                    index: 1,
                  },
                ],
              },
            },
          },
          include: {
            questionOptions: true,
          },
        }),
        tx.question.create({
          data: {
            question: "Is water wet?",
            activeFromDate: pastDate,
            source: "crocodile",
            type: QuestionType.BinaryQuestion,
            revealToken: Token.Bonk,
            revealTokenAmount: 5000,
            creditCostPerQuestion: 2,
            questionOptions: {
              createMany: {
                data: [
                  {
                    option: "Yes",
                    isLeft: true,
                    calculatedIsCorrect: true,
                    calculatedPercentageOfSelectedAnswers: 85,
                    calculatedAveragePercentage: 60,
                    index: 0,
                  },
                  {
                    option: "No",
                    isLeft: false,
                    calculatedIsCorrect: false,
                    calculatedPercentageOfSelectedAnswers: 15,
                    calculatedAveragePercentage: 40,
                    index: 1,
                  },
                ],
              },
            },
          },
          include: {
            questionOptions: true,
          },
        }),
      ]);

      questionIds = questions.map((q) => q.id);
      questionUuids = questions.map((q) => q.uuid);

      question1OptionUuids = questions[1].questionOptions.map((qo) => qo.uuid);

      await tx.deckQuestion.createMany({
        data: [
          { deckId: deckId, questionId: questions[0].id },
          { deckId: deckId, questionId: questions[1].id },
        ],
      });
    });
  });

  afterAll(async () => {
    delete process.env.BACKEND_SECRET; // Clean up
    // Clean up the data after the test
    await prisma.$transaction(async (tx) => {
      await tx.chompResult.deleteMany({
        where: { userId: { in: [user1.id, user2.id] } },
      });
      await tx.questionAnswer.deleteMany({
        where: { userId: { in: [user1.id, user2.id] } },
      });
      await tx.questionOption.deleteMany({
        where: { questionId: { in: questionIds } },
      });
      await tx.deckQuestion.deleteMany({
        where: {
          questionId: {
            in: questionIds,
          },
        },
      });
      await tx.question.deleteMany({ where: { id: { in: questionIds } } });
      await tx.deck.deleteMany({ where: { id: { equals: deckId } } });
      await tx.wallet.deleteMany({
        where: { userId: { in: [user1.id, user2.id] } },
      });
      await tx.user.deleteMany({ where: { id: { in: [user1.id, user2.id] } } });
    });
  });

  it("should successfully submit multiple answers", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue([
        {
          userAddress: user1.wallet,
          source: "crocodile",
          firstOrderOptionId: question1OptionUuids[0],
          secondOrderOptionId: question1OptionUuids[0],
          secondOrderOptionEstimate: 0.5,
          weight: 1.0,
        },
        {
          userAddress: user2.wallet,
          source: "crocodile",
          firstOrderOptionId: question1OptionUuids[1],
          secondOrderOptionId: question1OptionUuids[1],
          secondOrderOptionEstimate: 0.5,
          weight: 1.0,
        },
        {
          // Last one is a duplicate
          userAddress: user2.wallet,
          source: "crocodile",
          firstOrderOptionId: question1OptionUuids[1],
          secondOrderOptionId: question1OptionUuids[1],
          secondOrderOptionEstimate: 0.5,
          weight: 1.0,
        },
      ]),
      headers: new Headers({
        source: "crocodile",
        "backend-secret": TEST_BACKEND_SECRET,
      }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest, {
      params: { id: questionUuids[1] },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(data.length).toBe(3);
    expect(data?.[0].answerId).toBeDefined();
    expect(data?.[0].success).toBeTruthy();
    expect(data?.[0].error).not.toBeDefined();
    expect(data?.[1].answerId).toBeDefined();
    expect(data?.[1].success).toBeTruthy();
    expect(data?.[1].error).not.toBeDefined();
    expect(data?.[0].answerId).not.toBe(data?.answers?.[1].answerId);
    expect(data?.[2].error).toBe("answer_invalid");
    expect(data?.[2].success).toBeFalsy();

    // Verify the stored percentage in the database
    const qAnswers = await prisma.questionAnswer.findMany({
      where: {
        uuid: data.answerId,
      },
      include: {
        questionOption: true,
      },
    });

    expect(qAnswers.length).toBeGreaterThan(0);

    // Find the answer for the first order option (should have null percentage)
    const firstOrderAnswer = qAnswers.find(
      (qa) => qa.questionOption.uuid === question1OptionUuids[0],
    );
    expect(firstOrderAnswer).toBeDefined();
    expect(firstOrderAnswer?.selected).toBe(true);
    expect(firstOrderAnswer?.percentage).toBe(50);

    // Find the answer for the second order option (this is where the percentage is set)
    const secondOrderAnswer = qAnswers.find(
      (qa) => qa.questionOption.uuid === question1OptionUuids[1],
    );
    expect(secondOrderAnswer).toBeDefined();
    expect(secondOrderAnswer?.selected).toBe(false);
    expect(secondOrderAnswer?.percentage).toBeNull();

    // Verify other answers for the same batch if necessary (e.g. for multi-choice)
    const questionOptionsForQuestion1 = await prisma.questionOption.count({
      where: { questionId: questionIds[1] },
    });
    expect(qAnswers.length).toBe(2 * questionOptionsForQuestion1);
  });
});
