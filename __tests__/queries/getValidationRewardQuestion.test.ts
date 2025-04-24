import { deleteDeck } from "@/app/actions/deck/deck";
import { getJwtPayload } from "@/app/actions/jwt";
import { getValidationRewardQuestions } from "@/app/queries/getValidationRewardQuestion";
import prisma from "@/app/services/prisma";
import { authGuard } from "@/app/utils/auth";
import { generateUsers } from "@/scripts/utils";

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
        revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        stackId: null,
        deckQuestions: {
          create: {
            question: {
              create: {
                stackId: null,
                question: `question ${currentDate}`,
                isSubmittedByUser: true,
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

  // Temporal & Error Handling
  it("should not return questionId if the question has expired", async () => {
    // Test implementation
  });

  it("should not return questionId if the mystery box is already opened for that id", async () => {
    // Test implementation
  });

  it("should return questionId if an unopened mystery box exists for that id", async () => {
    // Test implementation
  });

  // Answer Validation
  it("should return questionId when the user has answered the question correctly and meets reward criteria", async () => {
    // Test implementation
  });

  // System Configuration & Payment
  it("should not return questionId if the question percentage is not selected for any of the options", async () => {
    // Test implementation
  });

  it("should not return questionId if the user is not charged for the question answer", async () => {
    // Test implementation
  });

  it("should handle unexpected errors gracefully", async () => {
    // Test implementation
  });

  it("should not return questionId if the user does not have permission", async () => {
    // Test implementation
  });
});
