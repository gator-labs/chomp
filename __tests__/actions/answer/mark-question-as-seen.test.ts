import { markQuestionAsSeenButNotAnswered } from "@/actions/answer/mark-question-as-seen";
import { getJwtPayload } from "@/app/actions/jwt";
import { getUserTotalCreditAmount } from "@/app/queries/home";
import prisma from "@/app/services/prisma";
import { AnswerStatus, QuestionType } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));

jest.mock("@/app/actions/fungible-asset", () => ({
  getUserCredits: jest.fn(),
  chargeUserCredits: jest.fn(),
}));

describe("markQuestionAsSeenButNotAnswered", () => {
  const userId = uuidv4();
  let questionId: number;
  let questionOptionIds: number[];

  beforeAll(async () => {
    // Create test question with two options
    const question = await prisma.question.create({
      data: {
        question: "Test question",
        type: QuestionType.BinaryQuestion,
        durationMiliseconds: 60000,
        stackId: null,
        revealAtAnswerCount: null,
        imageUrl: "",
        questionOptions: {
          createMany: {
            data: [
              { option: "Option 1", isCorrect: true, isLeft: true },
              { option: "Option 2", isCorrect: false, isLeft: false },
            ],
          },
        },
      },
      include: {
        questionOptions: true,
      },
    });

    questionId = question.id;
    questionOptionIds = question.questionOptions.map((opt) => opt.id);
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.questionAnswer.deleteMany({
      where: { questionOptionId: { in: questionOptionIds } },
    });
    await prisma.question.delete({ where: { id: questionId } });
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION = "true";
    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: userId });
  });

  it("should create viewed answers and charge credits when user has sufficient credits", async () => {
    // Setup: User has enough credits
    (getUserTotalCreditAmount as jest.Mock).mockResolvedValue(10);

    // Act
    await markQuestionAsSeenButNotAnswered(questionId);

    // Assert question answers were created
    const answers = await prisma.questionAnswer.findMany({
      where: {
        questionOptionId: { in: questionOptionIds },
        userId,
      },
    });

    expect(answers).toHaveLength(2);
    answers.forEach((answer) => {
      expect(answer).toMatchObject({
        userId,
        status: AnswerStatus.Viewed,
        selected: false,
      });
    });

    // Assert credits were charged
    const { chargeUserCredits } = require("@/app/actions/fungible-asset");
    expect(chargeUserCredits).toHaveBeenCalledWith(questionId);
  });

  it("should not create answers or charge credits when user has insufficient credits", async () => {
    // Setup: User has no credits
    (getUserTotalCreditAmount as jest.Mock).mockResolvedValue(0);

    // Act
    await markQuestionAsSeenButNotAnswered(questionId);

    // Assert no answers were created
    const answers = await prisma.questionAnswer.findMany({
      where: {
        questionOptionId: { in: questionOptionIds },
        userId,
      },
    });

    expect(answers).toHaveLength(0);

    // Assert no credits were charged
    const { chargeUserCredits } = require("@/app/actions/fungible-asset");
    expect(chargeUserCredits).not.toHaveBeenCalled();
  });
});
