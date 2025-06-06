import { deleteDeck } from "@/app/actions/deck/deck";
import { getJwtPayload } from "@/app/actions/jwt";
import { getValidationRewardQuestions } from "@/app/queries/getValidationRewardQuestion";
import prisma from "@/app/services/prisma";
import { authGuard } from "@/app/utils/auth";
import { generateUsers } from "@/scripts/utils";
import {
  AnswerStatus,
  FungibleAsset,
  TransactionLogType,
} from "@prisma/client";

jest.mock("@/app/utils/auth");

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));
jest.mock("next/headers", () => ({
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

jest.mock("p-retry", () => jest.fn().mockImplementation((fn) => fn()));

describe("getValidationRewardQuestion", () => {
  const currentDate = new Date();
  let userId: string;
  let userId1: string;
  let userId2: string;
  let deckId: number;
  let deckQuestionId: number;
  let questionOptionsIds: number[];

  beforeAll(async () => {
    const users = await generateUsers(3);
    userId = users[0].id;
    userId1 = users[1].id;
    userId2 = users[2].id;
    await prisma.user.createMany({
      data: users,
    });

    // create a new deck
    const deck = await prisma.deck.create({
      data: {
        deck: `deck ${currentDate}`,
        revealAtDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        stackId: null,
        creditCostPerQuestion: 1,
        deckQuestions: {
          create: {
            question: {
              create: {
                stackId: null,
                question: `question ${currentDate}`,
                isSubmittedByUser: true,
                type: "MultiChoice",
                creditCostPerQuestion: 1,
                revealTokenAmount: 10,
                revealAtDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
                durationMiliseconds: BigInt(60000),
                questionOptions: {
                  create: [
                    {
                      option: "A",
                      isCorrect: true,
                      isLeft: false,
                      index: 0,
                    },
                    {
                      option: "B",
                      isCorrect: false,
                      isLeft: false,
                      index: 1,
                    },
                    {
                      option: "C",
                      isCorrect: false,
                      isLeft: false,
                      index: 2,
                    },
                    {
                      option: "D",
                      isCorrect: false,
                      isLeft: false,
                      index: 3,
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

    deckId = deck.id;
    deckQuestionId = deck.deckQuestions[0].questionId;
    questionOptionsIds = deck.deckQuestions[0].question.questionOptions.map(
      (qo) => qo.id,
    );

    const userIds = [userId1, userId2];

    const answerData = userIds.flatMap((userId) =>
      questionOptionsIds.map((id, index) => ({
        questionOptionId: id,
        userId,
        status: AnswerStatus.Submitted,
        selected: index === 0,
      })),
    );

    await prisma.questionAnswer.createMany({
      data: answerData,
    });
  });

  // delete all the dummy data after test completion
  afterAll(async () => {
    await deleteDeck(deckId);

    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: {
        userId: { in: [userId, userId1, userId2] },
      },
    });

    await prisma.userBalance.deleteMany({
      where: {
        userId: { in: [userId, userId1, userId2] },
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: { in: [userId, userId1, userId2] },
      },
    });
  });

  it("should not return questionId if the user has not answered the question", async () => {
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: userId,
    });
    const result = await getValidationRewardQuestions();
    expect(result?.length).toBe(0);
  });

  it("should not return questionId if the question percentage is not selected for any of the options", async () => {
    // Mock the return value of getJwtPayload to simulate the user context
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: userId,
    });
    (authGuard as jest.Mock).mockResolvedValue({ sub: userId });

    await prisma.questionOption.updateMany({
      where: {
        id: {
          in: questionOptionsIds,
        },
      },
      data: {
        calculatedAveragePercentage: 25,
      },
    });

    await prisma.fungibleAssetTransactionLog.create({
      data: {
        change: -1,
        userId,
        type: TransactionLogType.PremiumQuestionCharge,
        asset: FungibleAsset.Credit,
        questionId: deckQuestionId,
      },
    });

    const answerData = questionOptionsIds.map((id, index) => ({
      questionOptionId: id,
      userId,
      status: AnswerStatus.Submitted,
      selected: index === 0,
    }));

    await prisma.questionAnswer.createMany({
      data: answerData,
    });

    const result = await getValidationRewardQuestions();

    expect(result?.length).toBe(0);
  });

  it("should return questionId when the user has answered the question correctly and meets reward criteria", async () => {
    // Mock the return value of getJwtPayload to simulate the user context
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: userId,
    });
    (authGuard as jest.Mock).mockResolvedValue({ sub: userId });

    await prisma.questionAnswer.updateMany({
      where: {
        userId,
        selected: true,
        questionOptionId: {
          in: questionOptionsIds,
        },
      },
      data: {
        percentage: 50,
      },
    });

    const result = await getValidationRewardQuestions();

    expect(result?.length).toBe(1);
  });
});
