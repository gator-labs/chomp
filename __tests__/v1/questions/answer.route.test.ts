import prisma from "@/app/services/prisma";
import { POST } from "@/app/v1/questions/[id]/answer/route";
import { faker } from "@faker-js/faker";
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

const generateWallet = () => {
  const keyBytes = crypto.randomBytes(32);
  return bs58.encode(keyBytes);
};

describe("API answer question", () => {
  const user1 = {
    id: uuidv4(),
    username: `user1`,
    wallet: generateWallet(),
  };

  const futureDate = dayjs().add(30, "day").toDate();
  const pastDate = dayjs().subtract(30, "day").toDate();

  let deckId: number;
  let questionIds: number[] = [];
  let questionUuids: string[] = [];
  let question0OptionUuids: string[] = [];
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

      question0OptionUuids = questions[0].questionOptions.map((qo) => qo.uuid);
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
    // Clean up the data after the test
    await prisma.$transaction(async (tx) => {
      await tx.chompResult.deleteMany({
        where: { userId: { equals: user1.id } },
      });
      await tx.questionAnswer.deleteMany({
        where: { userId: { equals: user1.id } },
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
      await tx.wallet.deleteMany({ where: { userId: { equals: user1.id } } });
      await tx.user.deleteMany({ where: { id: { equals: user1.id } } });
    });
  });

  it("should reject request with missing parameter", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        source: "crocodile",
        firstOrderOptionId: question0OptionUuids[0],
        secondOrderOptionId: question0OptionUuids[1],
        secondOrderEstimate: 0.5,
      }),
      headers: new Headers({
        source: "crocodile",
        "backend-secret": process.env.BACKEND_SECRET || "",
      }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest, {
      params: { id: questionUuids[0] },
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("answer_invalid");
  });

  it("should reject out of range estimate", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userAddress: user1.wallet,
        source: "crocodile",
        firstOrderOptionId: question0OptionUuids[0],
        secondOrderOptionId: question0OptionUuids[1],
        secondOrderEstimate: 1.1,
      }),
      headers: new Headers({
        source: "crocodile",
        "backend-secret": process.env.BACKEND_SECRET || "",
      }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest, {
      params: { id: questionUuids[0] },
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("answer_invalid");
  });

  it("should not answer inactive question", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userAddress: user1.wallet,
        source: "crocodile",
        firstOrderOptionId: question0OptionUuids[0],
        secondOrderOptionId: question0OptionUuids[1],
        secondOrderEstimate: 0.5,
      }),
      headers: new Headers({
        source: "crocodile",
        "backend-secret": process.env.BACKEND_SECRET || "",
      }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest, {
      params: { id: questionUuids[0] },
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("question_inactive");
  });

  it("should not answer when when options are from another question", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userAddress: user1.wallet,
        source: "crocodile",
        firstOrderOptionId: question0OptionUuids[0],
        secondOrderOptionId: question0OptionUuids[1],
        secondOrderEstimate: 0.5,
      }),
      headers: new Headers({
        source: "crocodile",
        "backend-secret": process.env.BACKEND_SECRET || "",
      }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest, {
      params: { id: questionUuids[1] },
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("option_invalid");
  });

  it("should successfully answer a question", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userAddress: user1.wallet,
        source: "crocodile",
        firstOrderOptionId: question1OptionUuids[0],
        secondOrderOptionId: question1OptionUuids[1],
        secondOrderEstimate: 0.5,
      }),
      headers: new Headers({
        source: "crocodile",
        "backend-secret": process.env.BACKEND_SECRET || "",
      }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest, {
      params: { id: questionUuids[1] },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(data.answerId).toBeDefined();
  });

  it("should not answer a question twice", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        userAddress: user1.wallet,
        source: "crocodile",
        firstOrderOptionId: question1OptionUuids[0],
        secondOrderOptionId: question1OptionUuids[1],
        secondOrderEstimate: 0.5,
      }),
      headers: new Headers({
        source: "crocodile",
        "backend-secret": process.env.BACKEND_SECRET || "",
      }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest, {
      params: { id: questionUuids[1] },
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("answer_invalid");
  });
});
