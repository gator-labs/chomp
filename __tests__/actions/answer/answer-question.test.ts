import { SaveQuestionRequest, answerQuestion } from "@/app/actions/answer";
import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { AnswerStatus, QuestionType } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));

jest.mock("@/app/services/prisma", () => ({
  questionOption: {
    findMany: jest.fn(),
  },
  questionAnswer: {
    findMany: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
}));

// Mock the return value for question answers (simulating no previous answers)
(prisma.questionAnswer.findMany as jest.Mock).mockResolvedValue([]);

// Mock $transaction to track the operations within it
const deleteManyMock = jest.fn();
const createManyMock = jest.fn();

(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
  await callback({
    questionAnswer: {
      deleteMany: deleteManyMock,
      createMany: createManyMock,
    },
  });
});

describe("answerQuestion", () => {
  let userId: string;
  let questionId: number;
  let questionOptionId: number;

  beforeAll(() => {
    // Set up mock user ID and question details
    userId = uuidv4();
    questionId = 123; // Mock question ID
    questionOptionId = 4449; // Mock question option ID

    // Mock the return value of getJwtPayload to simulate the user context
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: userId,
    });
  });

  it("should allow a user to answer a question once", async () => {
    (prisma.questionOption.findMany as jest.Mock).mockResolvedValue([
      {
        id: 4449,
        option: "Yes",
        isCorrect: false,
        calculatedIsCorrect: null,
        calculatedAveragePercentage: null,
        calculatedPercentageOfSelectedAnswers: null,
        isLeft: true,
        createdAt: new Date("2024-11-20T13:05:20.343Z"),
        updatedAt: new Date("2024-11-20T13:06:50.463Z"),
        questionId: questionId,
        question: {
          id: questionId,
          question:
            "Should we attempt to resurrect extinct species through cloning?",
          durationMiliseconds: 60000,
          type: QuestionType.BinaryQuestion,
          revealToken: "Bonk",
          revealTokenAmount: 5000,
          revealAtDate: new Date("2024-11-24T00:00:00.000Z"),
          revealAtAnswerCount: null,
          imageUrl: "",
          createdAt: new Date("2024-11-20T13:05:20.343Z"),
          updatedAt: new Date("2024-11-20T13:06:50.463Z"),
          stackId: 36,
        },
      },
      {
        id: 4450,
        option: "No",
        isCorrect: false,
        calculatedIsCorrect: null,
        calculatedAveragePercentage: null,
        calculatedPercentageOfSelectedAnswers: null,
        isLeft: false,
        createdAt: new Date("2024-11-20T13:05:20.343Z"),
        updatedAt: new Date("2024-11-20T13:06:50.463Z"),
        questionId: questionId,
        question: {
          id: questionId,
          question:
            "Should we attempt to resurrect extinct species through cloning?",
          durationMiliseconds: 60000,
          type: QuestionType.BinaryQuestion,
          revealToken: "Bonk",
          revealTokenAmount: 5000,
          revealAtDate: new Date("2024-11-24T00:00:00.000Z"),
          revealAtAnswerCount: null,
          imageUrl: "",
          createdAt: new Date("2024-11-20T13:05:20.343Z"),
          updatedAt: new Date("2024-11-20T13:06:50.463Z"),
          stackId: 36,
        },
      },
    ]);

    (prisma.questionAnswer.findMany as jest.Mock).mockResolvedValue([
      {
        id: 1200,
        createdAt: new Date(),
        updatedAt: new Date(),
        questionOptionId: 4449,
        userId,
        percentage: null,
        status: AnswerStatus.Viewed,
        selected: false,
        timeToAnswer: null,
      },
      {
        id: 1201,
        createdAt: new Date(),
        updatedAt: new Date(),
        questionOptionId: 4450,
        userId,
        percentage: null,
        status: AnswerStatus.Viewed,
        selected: false,
        timeToAnswer: null,
      },
    ]);

    const request: SaveQuestionRequest = {
      questionId,
      questionOptionId,
      percentageGiven: 50,
      timeToAnswerInMiliseconds: 5000,
    };

    await answerQuestion(request);

    expect(deleteManyMock).toHaveBeenCalledWith({
      where: {
        questionOption: {
          questionId,
        },
        userId,
      },
    });

    expect(createManyMock).toHaveBeenCalled();
  });

  it("should not allow a user to answer the same question twice", async () => {
    (prisma.questionOption.findMany as jest.Mock).mockResolvedValue([
      {
        id: 4449,
        option: "Yes",
        isCorrect: false,
        calculatedIsCorrect: null,
        calculatedAveragePercentage: null,
        calculatedPercentageOfSelectedAnswers: null,
        isLeft: true,
        createdAt: new Date("2024-11-20T13:05:20.343Z"),
        updatedAt: new Date("2024-11-20T13:06:50.463Z"),
        questionId: questionId,
        question: {
          id: questionId,
          question:
            "Should we attempt to resurrect extinct species through cloning?",
          durationMiliseconds: 60000,
          type: QuestionType.BinaryQuestion,
          revealToken: "Bonk",
          revealTokenAmount: 5000,
          revealAtDate: new Date("2024-11-24T00:00:00.000Z"),
          revealAtAnswerCount: null,
          imageUrl: "",
          createdAt: new Date("2024-11-20T13:05:20.343Z"),
          updatedAt: new Date("2024-11-20T13:06:50.463Z"),
          stackId: 36,
        },
      },
      {
        id: 4450,
        option: "No",
        isCorrect: false,
        calculatedIsCorrect: null,
        calculatedAveragePercentage: null,
        calculatedPercentageOfSelectedAnswers: null,
        isLeft: false,
        createdAt: new Date("2024-11-20T13:05:20.343Z"),
        updatedAt: new Date("2024-11-20T13:06:50.463Z"),
        questionId: questionId,
        question: {
          id: questionId,
          question:
            "Should we attempt to resurrect extinct species through cloning?",
          durationMiliseconds: 60000,
          type: QuestionType.BinaryQuestion,
          revealToken: "Bonk",
          revealTokenAmount: 5000,
          revealAtDate: new Date("2024-11-24T00:00:00.000Z"),
          revealAtAnswerCount: null,
          imageUrl: "",
          createdAt: new Date("2024-11-20T13:05:20.343Z"),
          updatedAt: new Date("2024-11-20T13:06:50.463Z"),
          stackId: 36,
        },
      },
    ]);

    (prisma.questionAnswer.findMany as jest.Mock).mockResolvedValue([
      {
        id: 1202,
        createdAt: new Date(),
        updatedAt: new Date(),
        questionOptionId,
        userId,
        percentage: null,
        status: AnswerStatus.Submitted,
        selected: true,
        timeToAnswer: 5000,
      },
      {
        id: 1203,
        createdAt: new Date(),
        updatedAt: new Date(),
        questionOptionId: 4450,
        userId,
        percentage: null,
        status: AnswerStatus.Submitted,
        selected: false,
        timeToAnswer: 5000,
      },
    ]);

    const request: SaveQuestionRequest = {
      questionId,
      questionOptionId,
      percentageGiven: 50,
      timeToAnswerInMiliseconds: 5000,
    };

    try {
      await answerQuestion(request);
    } catch (error: any) {
      expect(error.message).toBe(
        `User with id: ${userId} has already answered question with id: ${questionId}`,
      );
    }

    expect(prisma.questionAnswer.createMany).not.toHaveBeenCalled();
  });
});
