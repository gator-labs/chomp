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
  let deckId: number;
  let deckQuestionId: number;

  beforeAll(async () => {
    const users = await generateUsers(1);
    userId = users[0].id;
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
    deckId = deck.id;
    deckQuestionId = deck.deckQuestions[0].questionId;
  });

  // delete all the dummy data after test completion
  afterAll(async () => {
    await deleteDeck(deckId);

    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: {
        userId: { in: [userId] },
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: { in: [userId] },
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
    //find question options
    const questionOptions = await prisma.questionOption.findMany({
      where: {
        question: {
          deckQuestions: {
            some: {
              deckId,
            },
          },
        },
      },
    });

    // Mock the return value of getJwtPayload to simulate the user context
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: userId,
    });
    (authGuard as jest.Mock).mockResolvedValue({ sub: userId });

    await prisma.questionOption.updateMany({
      where: {
        id: {
          in: questionOptions.map((qo) => qo.id),
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

    const answerData = questionOptions.map((qo, index) => ({
      questionOptionId: qo.id,
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
    //find question options
    const questionOptions = await prisma.questionOption.findMany({
      where: {
        question: {
          deckQuestions: {
            some: {
              deckId,
            },
          },
        },
      },
    });

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
          in: questionOptions.map((qo) => qo.id),
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
