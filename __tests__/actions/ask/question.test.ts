import { createAskQuestion } from "@/app/actions/ask/question";
import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { QuestionType } from "@prisma/client";
import { revalidatePath } from "next/cache";

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockQuestionData = {
  question: "What is the capital of France?",
  type: QuestionType.BinaryQuestion,
  questionOptions: [{ option: "Paris" }, { option: "London" }],
};

let questionId: number | undefined;

describe("createAskQuestion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getJwtPayload as jest.Mock).mockResolvedValue({ userId: 1 });
  });

  afterAll(async () => {
    // First get the question options
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { questionOptions: true },
    });

    // Then delete the options
    if (question && question.questionOptions.length > 0) {
      await prisma.questionOption.deleteMany({
        where: {
          id: {
            in: question.questionOptions.map((qo) => qo.id),
          },
        },
      });
    }

    // Finally delete the question
    await prisma.question.delete({
      where: { id: questionId },
    });
  });

  it("should return undefined for unauthorized users", async () => {
    (getJwtPayload as jest.Mock).mockResolvedValue(null);
    const result = await createAskQuestion(mockQuestionData);
    expect(result).toBeNull();
  });

  it("should return validation errors for invalid input", async () => {
    const invalidData = { ...mockQuestionData, question: "Hi" };
    const result = await createAskQuestion(invalidData);

    expect(result).toEqual({
      errorMessage: "Question: String must contain at least 5 character(s)",
      success: false,
    });
  });

  it("should create question with valid data", async () => {
    await createAskQuestion(mockQuestionData);

    const result = await prisma.question.findFirst({
      where: {
        isSubmittedByUser: true,
      },
      include: {
        questionOptions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    expect(result?.question).toBe(mockQuestionData.question);

    questionId = result?.id;

    // Verify cache invalidation
    expect(revalidatePath).toHaveBeenCalledWith("/application/ask");
  });
});
