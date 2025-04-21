import { markQuestionAsSeenButNotAnswered } from "@/actions/answers/markQuestionAsSeenButNotAnswered";
import { getJwtPayload } from "@/app/actions/jwt";
import { getUserTotalCreditAmount } from "@/app/queries/home";
import prisma from "@/app/services/prisma";
import { authGuard } from "@/app/utils/auth";
import { AnswerStatus, QuestionType, Token } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));

jest.mock("@/app/queries/home", () => ({
  getUserTotalCreditAmount: jest.fn(),
}));

jest.mock("@/app/utils/auth", () => ({
  authGuard: jest.fn(),
}));

jest.mock("p-retry", () => jest.fn().mockImplementation((fn) => fn()));

describe("markQuestionAsSeenButNotAnswered", () => {
  const userId = uuidv4();
  (authGuard as jest.Mock).mockResolvedValue({ sub: userId });

  let currentDeckId: number;
  let currentQuestionId: number;
  let deckQuestionId: number;
  let currentQuestionOptions: any;

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
    // Create test user first
    await prisma.user.create({
      data: {
        id: userId,
      },
    });

    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: userId,
    });

    // Create test deck
    const deck = await prisma.deck.create({
      data: {
        deck: `markQuestionAsSeenButNotAnswered.test.ts ${new Date().getTime()}`,
        description: "Description",
        footer: "Footer",
        imageUrl: "",
        stackId: null,
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

    // Fetch the created options
    const createdOptions = await prisma.questionOption.findMany({
      where: { questionId: question.id },
    });
    currentQuestionOptions = createdOptions;

    // Create deck question association
    const deckQuestion = await prisma.deckQuestion.create({
      data: {
        deckId: currentDeckId,
        questionId: currentQuestionId,
      },
    });
    deckQuestionId = deckQuestion.id;
  });

  afterEach(async () => {
    // Clean up all transactions and answers for this user
    await prisma.questionAnswer.deleteMany({
      where: {
        OR: [
          { userId },
          {
            questionOptionId: {
              in: currentQuestionOptions.map((opt: { id: any }) => opt.id),
            },
          },
        ],
      },
    });
  });

  afterAll(async () => {
    // Clean up in reverse order
    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: { userId },
    });
    await prisma.questionAnswer.deleteMany({
      where: { userId },
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

    // Delete test user last
    await prisma.user.delete({
      where: { id: userId },
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION = "true";
    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: userId });
  });

  it("should create viewed answers for all question options", async () => {
    // Setup: User has enough credits
    (getUserTotalCreditAmount as jest.Mock).mockResolvedValue(10);

    // Act
    await markQuestionAsSeenButNotAnswered(currentQuestionId);

    // Assert: QuestionAnswers were created for all options
    const questionOptionsIds = currentQuestionOptions.map(
      (opt: { id: any }) => opt.id,
    );

    const answers = await prisma.questionAnswer.findMany({
      where: {
        questionOptionId: { in: questionOptionsIds },
        userId,
      },
    });

    // Verify number of answers matches number of options
    expect(answers).toHaveLength(currentQuestionOptions.length);

    // Verify each answer has correct properties
    answers.forEach((answer) => {
      expect(answer).toMatchObject({
        userId,
        status: AnswerStatus.Viewed,
        selected: false,
      });
    });
  });
});
