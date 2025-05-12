import prisma from "@/app/services/prisma";
import { PUT } from "@/app/v1/questions/[id]/route";
import { QuestionType, Token } from "@prisma/client";
import dayjs from "dayjs";
import { NextRequest } from "next/server";

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
  });

  it("should reject resolvesAt < activeDate", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        source: "crocodile",
        resolvesAt: futureDate,
      }),
      headers: new Headers({
        source: "crocodile",
        "backend-secret": process.env.BACKEND_SECRET || "",
      }),
    } as unknown as NextRequest;

    const response = await PUT(mockRequest, {
      params: { id: questionUuids[0] },
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("question_invalid");
    expect(data.message).toBe("resolvesAt must be after activeDate");
  });

  it("should reject past resolvesAt date", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        source: "crocodile",
        resolvesAt: pastDate,
      }),
      headers: new Headers({
        source: "crocodile",
        "backend-secret": process.env.BACKEND_SECRET || "",
      }),
    } as unknown as NextRequest;

    const response = await PUT(mockRequest, {
      params: { id: questionUuids[0] },
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("question_invalid");
    expect(data.message).toBe("resolvesAt must be in the future");
  });

  it("should update question", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        source: "crocodile",
        resolvesAt: futureDate,
      }),
      headers: new Headers({
        source: "crocodile",
        "backend-secret": process.env.BACKEND_SECRET || "",
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
      }),
      headers: new Headers({
        source: "crocodile",
        "backend-secret": process.env.BACKEND_SECRET || "",
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
        resolvesAt: null,
      }),
      headers: new Headers({
        source: "crocodile",
        "backend-secret": process.env.BACKEND_SECRET || "",
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
