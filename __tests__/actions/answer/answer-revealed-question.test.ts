import {
  SaveQuestionRequest,
  answerQuestion,
} from "@/actions/answers/answerQuestion";
import { getJwtPayload } from "@/app/actions/jwt";
import { deckSchema } from "@/app/schemas/deck";
import prisma from "@/app/services/prisma";
import { QuestionType, Token } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));
jest.mock("p-retry", () => ({
  retry: jest.fn((fn) => fn()),
}));

describe("answering already revealed question", () => {
  const userId = uuidv4();
  let currentDeckId: number;
  let currentQuestionId: number;
  let deckQuestionId: number;
  let currentQuestionOptions: any;
  const currentDate = new Date("2024-07-20 16:19:30.717");

  // Dummy deck data
  const deckMockData = {
    deck: `deck ${new Date().getTime()}`,
    description: "Description",
    footer: "Footer",
    tagIds: [],
    stackId: null,
    revealToken: "Bonk",
    activeFromDate: new Date(currentDate.setDate(currentDate.getDate() - 1)),
    revealAtDate: new Date("2024-07-21 16:19:30.717"),
    revealTokenAmount: 50,
    revealAtAnswerCount: null,
    durationMiliseconds: 10,
    questions: [],
    imageUrl: "",
  } as unknown as z.infer<typeof deckSchema>;

  const questionMockData = {
    question: "What is the capital of France?",
    type: QuestionType.BinaryQuestion,
    durationMiliseconds: 60000,
    revealToken: Token.Bonk,
    revealAtDate: new Date("2024-07-21 16:19:30.717"),
    revealTokenAmount: 50,
  };

  const questionOptionMockData = [
    {
      option: "Paris",
      isCorrect: true,
      isLeft: true,
    },
    {
      option: "London",
      isCorrect: false,
      isLeft: false,
    },
  ];

  beforeAll(async () => {
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: userId,
    });
    const deck = await prisma.deck.create({
      data: {
        deck: deckMockData.deck,
        imageUrl: deckMockData.imageUrl,
        revealAtDate: deckMockData.revealAtDate,
        revealAtAnswerCount: deckMockData.revealAtAnswerCount,
        date: deckMockData.date,
        activeFromDate: deckMockData.activeFromDate,
        stackId: deckMockData.stackId,
        description: deckMockData.description,
        footer: deckMockData.footer,
        heading: deckMockData.heading,
      },
    });
    currentDeckId = deck.id;

    const question = await prisma.question.create({
      data: {
        question: questionMockData.question,
        type: questionMockData.type,
        revealToken: questionMockData.revealToken,
        revealTokenAmount: questionMockData.revealTokenAmount,
        revealAtDate: questionMockData.revealAtDate,
        durationMiliseconds: questionMockData.durationMiliseconds,
        stackId: null,
        revealAtAnswerCount: null,
        imageUrl: "",
      },
    });

    currentQuestionId = question.id;

    await prisma.questionOption.createMany({
      data: questionOptionMockData.map((qo) => ({
        ...qo,
        questionId: question.id,
      })),
    });

    // Fetch the newly created options
    const createdOptions = await prisma.questionOption.findMany({
      where: { questionId: question.id },
    });

    currentQuestionOptions = createdOptions;

    const deckQuestion = await prisma.deckQuestion.create({
      data: {
        deckId: currentDeckId,
        questionId: currentQuestionId,
      },
    });

    deckQuestionId = deckQuestion.id;
  });

  afterAll(async () => {
    await prisma.deckQuestion.delete({
      where: {
        id: deckQuestionId,
      },
    });
    await prisma.deck.delete({
      where: {
        id: currentDeckId,
      },
    });
    await prisma.questionOption.deleteMany({
      where: {
        questionId: currentQuestionId,
      },
    });
    await prisma.question.delete({
      where: {
        id: currentQuestionId,
      },
    });
  });

  it("should throw an error if the user tries to answer a revealed question", async () => {
    const request: SaveQuestionRequest = {
      questionId: currentQuestionId,
      questionOptionId: currentQuestionOptions[0].id,
      percentageGiven: 50,
      timeToAnswerInMiliseconds: 5000,
    };

    try {
      await answerQuestion(request); // Call the method under test
    } catch (error: any) {
      expect(error.message).toBe(
        `Question with id: ${request.questionId} does not exist or it is revealed and cannot be answered.`,
      );
    }
  });
});
