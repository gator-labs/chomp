import { answerQuestion } from "@/app/actions/answer";
import { getJwtPayload } from "@/app/actions/jwt";
import { getStack } from "@/app/queries/stack";
import prisma from "@/app/services/prisma";
import { authGuard } from "@/app/utils/auth";
import { faker } from "@faker-js/faker";
import {
  ResultType,
  TransactionStatus,
} from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

// Mock retry since it's used in the codebase
jest.mock("p-retry", () => ({
  retry: jest.fn((fn) => fn()),
}));

// Mock authGuard since it's used in getStack
jest.mock("@/app/utils/auth", () => ({
  authGuard: jest.fn(),
}));

// Mock JWT payload since it's used in getStack
jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));

const generateTxHash = () => {
  return faker.string.fromCharacters(
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
    { min: 88, max: 88 },
  );
};

describe("getStackWithResults", () => {
  let stackId: number;
  let deckIds: number[] = [];
  let questionIds: number[] = [];
  let deckQuestionIds: number[] = [];

  const user0 = {
    id: uuidv4(),
    username: `user0`,
  };

  const user1 = {
    id: uuidv4(),
    username: `user1`,
  };

  beforeAll(async () => {
    (authGuard as jest.Mock).mockResolvedValue({ sub: user0.id });

    await prisma.$transaction(async (tx) => {
      // Create a test stack
      const createdStack = await tx.stack.create({
        data: {
          name: "Test Stack",
          isActive: true,
          isVisible: true,
          image: "https://example.com/test-stack-image.jpg", // Required field from schema
        },
      });
      stackId = createdStack.id;

      tx.user.create({ data: user0 });
      tx.user.create({ data: user1 });

      const deck = await tx.deck.create({
        data: {
          deck: `deck ${new Date().getTime()}`,
          revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          stackId,
          deckQuestions: {
            create: {
              question: {
                create: {
                  stackId: null,
                  question: "Bonkaton question?",
                  type: "MultiChoice",
                  revealTokenAmount: 10,
                  revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                  durationMiliseconds: BigInt(60000),
                  questionOptions: {
                    create: [
                      {
                        option: "A",
                        isCorrect: true,
                        isLeft: false,
                      },
                      {
                        option: "B",
                        isCorrect: false,
                        isLeft: false,
                      },
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
                    ],
                  },
                },
              },
            },
          },
        },
        include: {
          deckQuestions: true,
        },
      });

      deckIds = [ deck.id ];

      await prisma.user.createMany({
        data: [user0, user1],
      });

      const deckQuestion = deck.deckQuestions[0];
      deckQuestionIds = [deck.deckQuestions[0].id];

      questionIds = [deckQuestion.id];

      const questionOptions = await tx.questionOption.findMany({
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

      await answerQuestion({
        questionId: deckQuestion.id,
        questionOptionId: questionOptions[0].id,
        percentageGiven: 50,
        percentageGivenForAnswerId: questionOptions[0].id,
        timeToAnswerInMiliseconds: 3638,
        deckId: deck.id,
      });

      await tx.chompResult.create({
        data: {
          userId: user0.id,
          result: ResultType.Revealed,
          questionId: deckQuestion.questionId,
          createdAt: new Date(),
          transactionStatus: TransactionStatus.Completed,
          burnTransactionSignature: generateTxHash(),
        },
      });
    });
  });

  afterAll(async () => {
    await prisma.$transaction(async (tx) => {
      await tx.chompResult.deleteMany({
        where: {
          userId: { in: [user0.id, user1.id] },
        },
      });
      await tx.questionAnswer.deleteMany({
        where: {
          userId: { in: [user0.id, user1.id] },
        },
      });
      await tx.questionOption.deleteMany({
        where: {
          questionId: { in: questionIds },
        },
      });
      await tx.deckQuestion.deleteMany({
        where: {
          id: { in: deckQuestionIds },
        },
      });
      await tx.question.deleteMany({
        where: {
          id: { in: questionIds },
        },
      });
      await tx.user.deleteMany({
        where: {
          id: { in: [user0.id, user1.id] },
        },
      });

      await tx.deck.deleteMany({
        where: {
          id: {
            in: deckIds,
          },
        },
      });

      await tx.stack.delete({
        where: {
          id: stackId,
        },
      });
    });
  });

  it("should verify that the user's ChompResults are returned with the stack", async () => {
    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user0.id });
    const result = await getStack(stackId);
    expect(
      result?.deck?.[0].deckQuestions?.[0]?.question?.chompResults.length ?? 0,
    ).toEqual(1);
  });

  it("should verify that the user's ChompResults are returned with the stack", async () => {
    (getJwtPayload as jest.Mock).mockResolvedValue(undefined);
    const result = await getStack(stackId);
    expect(
      result?.deck?.[0].deckQuestions?.[0]?.question?.chompResults.length ?? 0,
    ).toEqual(0);
  });
});
