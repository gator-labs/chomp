import prisma from "@/app/services/prisma";
import { authGuard } from "@/app/utils/auth";
import { chargeUserCredits } from "@/lib/credits/chargeUserCredits";
import {
  FungibleAsset,
  QuestionType,
  TransactionLogType,
} from "@prisma/client";
import { randomUUID } from "crypto";

jest.mock("p-retry", () => jest.fn().mockImplementation((fn) => fn()));
jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));
jest.mock("@/app/utils/auth");

describe("chargeUserCredits", () => {
  const mockUserId = randomUUID();
  let currentDeckId: number;
  let currentQuestionId: number;
  let deckQuestionId: number;
  let currentQuestionOptions: any;

  const questionMockData = {
    question: "What is the capital of France?",
    type: QuestionType.BinaryQuestion,
    durationMiliseconds: 60000,
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
    // Create test user
    await prisma.user.create({
      data: {
        id: mockUserId,
      },
    });

    // Create test deck
    const deck = await prisma.deck.create({
      data: {
        deck: `chargeUserCredits.test.ts ${new Date().getTime()}`,
        description: "Test Description",
        footer: "Test Footer",
        imageUrl: "",
        stackId: null,
        creditCostPerQuestion: 10,
        revealAtAnswerCount: null,
        activeFromDate: new Date(),
      },
    });
    currentDeckId = deck.id;

    // Create test question
    const question = await prisma.question.create({
      data: {
        question: questionMockData.question,
        type: questionMockData.type,
        durationMiliseconds: questionMockData.durationMiliseconds,
        stackId: null,
        revealAtAnswerCount: null,
        imageUrl: "",
        creditCostPerQuestion: 10,
      },
    });
    currentQuestionId = question.id;

    // Create question options
    await prisma.questionOption.createMany({
      data: questionOptionMockData.map((qo) => ({
        ...qo,
        questionId: question.id,
      })),
    });

    // Fetch created options
    const createdOptions = await prisma.questionOption.findMany({
      where: { questionId: question.id },
    });
    currentQuestionOptions = createdOptions;

    // Link question to deck
    const deckQuestion = await prisma.deckQuestion.create({
      data: {
        deckId: currentDeckId,
        questionId: currentQuestionId,
      },
    });
    deckQuestionId = deckQuestion.id;
  });

  afterAll(async () => {
    // Clean up in reverse order
    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: { userId: mockUserId },
    });
    await prisma.questionAnswer.deleteMany({
      where: {
        questionOptionId: {
          in: currentQuestionOptions.map((opt: { id: any }) => opt.id),
        },
      },
    });
    await prisma.deckQuestion.delete({
      where: { id: deckQuestionId },
    });
    await prisma.deck.delete({
      where: { id: currentDeckId },
    });
    await prisma.questionOption.deleteMany({
      where: { questionId: currentQuestionId },
    });
    await prisma.question.delete({
      where: { id: currentQuestionId },
    });
    await prisma.user.delete({
      where: { id: mockUserId },
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION = "true";
    (authGuard as jest.Mock).mockResolvedValue({ sub: mockUserId });
  });

  afterEach(async () => {
    // Clean up all transactions and answers for this user
    await prisma.questionAnswer.deleteMany({
      where: { userId: mockUserId },
    });
    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: { userId: mockUserId },
    });
  });

  it("should throw an error if user has insufficient credits", async () => {
    // Setup: Create initial balance of 5 credits
    await prisma.fungibleAssetTransactionLog.create({
      data: {
        type: TransactionLogType.CreditByAdmin,
        asset: FungibleAsset.Credit,
        change: 10,
        userId: mockUserId,
      },
    });

    try {
      await chargeUserCredits(currentQuestionId);
    } catch (error: any) {
      expect(error.message).toBe(
        `User has insufficient credits to charge for question ${currentQuestionId}`,
      );
    }

    // Verify no new transaction was created
    const transactions = await prisma.fungibleAssetTransactionLog.findMany({
      where: { userId: mockUserId },
    });
    expect(transactions).toHaveLength(2); // Only the initial grant should exist
  });

  it("should successfully deduct credits when user has sufficient balance", async () => {
    // Setup: Create initial balance of 20 credits
    await prisma.fungibleAssetTransactionLog.create({
      data: {
        type: TransactionLogType.CreditByAdmin,
        asset: FungibleAsset.Credit,
        change: 20,
        userId: mockUserId,
      },
    });

    await chargeUserCredits(currentQuestionId);

    // Verify the transactions
    const transactions = await prisma.fungibleAssetTransactionLog.findMany({
      where: { userId: mockUserId },
      orderBy: { createdAt: "asc" },
    });

    expect(transactions).toHaveLength(2);
    expect(Number(transactions[0].change)).toBe(20); // Initial grant
    expect(Number(transactions[1].change)).toBe(-10); // Deduction
    expect(transactions[1].type).toBe(TransactionLogType.PremiumQuestionCharge);
    expect(transactions[1].questionId).toBe(currentQuestionId);
  });
});
