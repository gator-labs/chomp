import prisma from "@/app/services/prisma";
import { PUT } from "@/app/v1/questions/[id]/route";
import { QuestionType, Token } from "@prisma/client";
import dayjs from "dayjs";
import { NextRequest } from "next/server";

const TEST_BACKEND_SECRET = "test-update-secret-789"; // Added a unique secret for this test suite

// Mock dependencies
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}));

jest.mock("@/app/queries/user", () => ({
  getCurrentUser: jest.fn(),
}));

describe("API update question", () => {
  const futureDate = dayjs().add(15, "day").toDate();
  const farFutureDate = dayjs().add(30, "day").toDate();
  const pastDate = dayjs().subtract(15, "day").toDate();

  let deckId: number;
  let questionIds: number[] = [];
  let questionUuids: string[] = [];

  beforeAll(async () => {
    process.env.BACKEND_SECRET = TEST_BACKEND_SECRET; // Set the secret
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

      // Create questions for decks
      const questions = await Promise.all([
        tx.question.create({
          data: {
            question: "Is the sky blue?",
            source: "crocodile",
            type: QuestionType.BinaryQuestion,
            activeFromDate: farFutureDate,
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

      await tx.deckQuestion.createMany({
        data: [
          { deckId: deckId, questionId: questions[0].id },
          { deckId: deckId, questionId: questions[1].id },
        ],
      });
    });
  });

  afterAll(async () => {
    await prisma.$transaction(async (tx) => {
      await tx.deckQuestion.deleteMany({
        where: {
          questionId: {
            in: questionIds,
          },
        },
      });
      await tx.questionOption.deleteMany({
        where: { questionId: { in: questionIds } },
      });
      await tx.question.deleteMany({ where: { id: { in: questionIds } } });
      await tx.deck.deleteMany({ where: { id: { equals: deckId } } });
    });
    delete process.env.BACKEND_SECRET; // Clean up the secret
  });

  it("should reject resolveAt < activeDate", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        source: "crocodile",
        activeDate: futureDate,
        resolveAt: futureDate,
        options: [
          { title: "Option 1", imageUrl: "http://example.com/image1.png" },
        ],
      }),
      headers: new Headers({
        source: "crocodile",
        "backend-secret": TEST_BACKEND_SECRET, // Use the constant
      }),
    } as unknown as NextRequest;

    const response = await PUT(mockRequest, {
      params: { id: questionUuids[0] },
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("question_invalid");
    expect(data.message).toBe("resolveAt must be after activeDate");
  });

  it("should reject past resolveAt date", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        source: "crocodile",
        activeDate: pastDate,
        resolveAt: pastDate,
        options: [
          { title: "Option 1", imageUrl: "http://example.com/image1.png" },
        ],
      }),
      headers: new Headers({
        source: "crocodile",
        "backend-secret": TEST_BACKEND_SECRET, // Use the constant
      }),
    } as unknown as NextRequest;

    const response = await PUT(mockRequest, {
      params: { id: questionUuids[0] },
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("question_invalid");
    expect(data.message).toBe("resolveAt must be in the future");
  });

  it("should update question", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        source: "crocodile",
        activeDate: futureDate,
        resolveAt: futureDate,
        options: [
          {
            title: "Updated Question 1",
            imageUrl: "http://example.com/image1.png",
          },
        ],
      }),
      headers: new Headers({
        source: "crocodile",
        "backend-secret": TEST_BACKEND_SECRET, // Use the constant
      }),
    } as unknown as NextRequest;

    const response = await PUT(mockRequest, {
      params: { id: questionUuids[1] },
    });

    await response.json();

    expect(response.status).toBe(200);

    const question = await prisma.question.findUniqueOrThrow({
      where: {
        id: questionIds[1],
      },
    });

    expect(question).toBeDefined();
    expect(question.revealAtDate?.toISOString()).toBe(futureDate.toISOString());
  });

  it("should do nothing if no value provided", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        source: "crocodile",
        activeDate: futureDate,
        options: [
          {
            title: "Updated Question 1",
            imageUrl: "http://example.com/image1.png",
          },
        ],
      }),
      headers: new Headers({
        source: "crocodile",
        "backend-secret": TEST_BACKEND_SECRET, // Use the constant
      }),
    } as unknown as NextRequest;

    const response = await PUT(mockRequest, {
      params: { id: questionUuids[1] },
    });

    await response.json();

    expect(response.status).toBe(200);

    const question = await prisma.question.findUniqueOrThrow({
      where: {
        id: questionIds[1],
      },
    });

    expect(question).toBeDefined();
    expect(question.revealAtDate?.toISOString()).toBe(futureDate.toISOString());
  });

  it("should clear the resolution date", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        source: "crocodile",
        activeDate: futureDate,
        resolveAt: null,
        options: [
          {
            title: "Updated Question 1",
            imageUrl: "http://example.com/image1.png",
          },
        ],
      }),
      headers: new Headers({
        source: "crocodile",
        "backend-secret": TEST_BACKEND_SECRET, // Use the constant
      }),
    } as unknown as NextRequest;

    const response = await PUT(mockRequest, {
      params: { id: questionUuids[1] },
    });

    await response.json();

    expect(response.status).toBe(200);

    const question = await prisma.question.findUniqueOrThrow({
      where: {
        id: questionIds[1],
      },
    });

    expect(question).toBeDefined();
    expect(question.revealAtDate?.toISOString()).toBeUndefined();
  });
});
