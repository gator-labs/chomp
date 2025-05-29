import prisma from "@/app/services/prisma";
import { GET } from "@/app/v1/questions/[id]/route";
import { QuestionType, Token } from "@prisma/client";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

// Helper to create a mock NextRequest
function createMockRequest({ headers = {} }: { headers: any }) {
  return {
    headers: {
      get: (key: any) => headers[key.toLowerCase()] || null,
    },
  };
}

describe("GET /v1/question/[id]", () => {
  const BACKEND_SECRET = "test-secret";
  let questionUuid: string;
  let questionOptionUuids: string[] = [];
  let questionOptionIds: number[] = [];
  const user = {
    id: uuidv4(),
    username: `user1`,
  };

  let questionWithNaNScoreUuid: string;
  let optionWithNaNScoreUuid: string;
  let optionWithNormalScoreUuid: string;

  beforeAll(async () => {
    process.env.BACKEND_SECRET = BACKEND_SECRET;

    const futureDate = dayjs().add(30, "day").toDate();
    const pastDate = dayjs().subtract(30, "day").toDate();

    await prisma.$transaction(async (tx) => {
      await prisma.user.createMany({
        data: user,
      });

      const question = await tx.question.create({
        data: {
          question: "Is water wet?",
          activeFromDate: pastDate,
          source: "crocodile",
          type: QuestionType.BinaryQuestion,
          revealToken: Token.Bonk,
          revealTokenAmount: 5000,
          revealAtDate: futureDate,
          uuid: uuidv4(),
          questionOptions: {
            createMany: {
              data: [
                {
                  option: "Yes",
                  isLeft: true,
                  calculatedIsCorrect: true,
                  calculatedPercentageOfSelectedAnswers: 85,
                  calculatedAveragePercentage: 60,
                  index: 0,
                  uuid: uuidv4(),
                  isCorrect: true,
                },
                {
                  option: "No",
                  isLeft: false,
                  calculatedIsCorrect: false,
                  calculatedPercentageOfSelectedAnswers: 15,
                  calculatedAveragePercentage: 40,
                  index: 1,
                  uuid: uuidv4(),
                  isCorrect: false,
                },
              ],
            },
          },
        },
        include: {
          questionOptions: true,
        },
      });

      questionUuid = question.uuid;
      questionOptionUuids = question.questionOptions.map((qo) => qo.uuid);
      questionOptionIds = question.questionOptions.map((qo) => qo.id);

      // Setup for NaN score test
      const nanQuestion = await tx.question.create({
        data: {
          question: "Test NaN score?",
          activeFromDate: pastDate,
          source: "crocodile_nan_test", // Use a distinct source
          type: QuestionType.BinaryQuestion,
          revealToken: Token.Bonk,
          revealTokenAmount: 100,
          uuid: uuidv4(),
          questionOptions: {
            createMany: {
              data: [
                {
                  option: "Option A (NaN score)",
                  index: 0,
                  uuid: uuidv4(),
                  score: NaN, // Set score to NaN
                },
                {
                  option: "Option B (Normal score)",
                  index: 1,
                  uuid: uuidv4(),
                  score: 0.75,
                },
              ],
            },
          },
        },
        include: {
          questionOptions: true,
        },
      });
      questionWithNaNScoreUuid = nanQuestion.uuid;
      optionWithNaNScoreUuid = nanQuestion.questionOptions.find(
        (opt) => opt.option === "Option A (NaN score)",
      )!.uuid;
      optionWithNormalScoreUuid = nanQuestion.questionOptions.find(
        (opt) => opt.option === "Option B (Normal score)",
      )!.uuid;

      for (const option of questionOptionIds) {
        // Apply percentages such that they sum up to 100 for each user's answer set
        await tx.questionAnswer.create({
          data: {
            userId: user.id,
            questionOptionId: option,
            percentage: option === questionOptionIds[0] ? 50 : null,
            selected: option === questionOptionIds[1] ? true : false,
            timeToAnswer: BigInt(Math.floor(Math.random() * 60000)), // Random time to answer within 60 seconds
          },
        });
      }
    });
  });

  afterAll(async () => {
    await prisma.questionAnswer.deleteMany({
      where: { userId: user.id },
    });

    await prisma.questionOption.deleteMany({
      where: {
        uuid: {
          in: questionOptionUuids,
        },
      },
    });

    await prisma.question.delete({
      where: { uuid: questionUuid },
    });

    // Cleanup for NaN test question
    const nanQuestionOptions = await prisma.questionOption.findMany({
      where: { question: { uuid: questionWithNaNScoreUuid } },
    });
    await prisma.questionOption.deleteMany({
      where: { uuid: { in: nanQuestionOptions.map((o) => o.uuid) } },
    });
    await prisma.question.delete({
      where: { uuid: questionWithNaNScoreUuid },
    });

    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
  });

  it("returns 401 if backend-secret is missing or incorrect", async () => {
    const req = createMockRequest({ headers: {} });
    const res = await GET(req as any, {
      params: {
        id: "1",
      },
    });
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({ error: "Unauthorized" });
  });

  it("returns 404 if question not found", async () => {
    const req = createMockRequest({
      headers: { "backend-secret": BACKEND_SECRET, source: "test-source" },
    });
    const res = await GET(req as any, {
      params: {
        id: uuidv4(),
      },
    });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("question_not_found");
    expect(json.message).toBe("No question exists with this id and source");
  });

  it("should handle NaN option score gracefully", async () => {
    const req = createMockRequest({
      headers: {
        "backend-secret": BACKEND_SECRET,
        source: "crocodile_nan_test",
      },
    });
    const res = await GET(req as any, {
      params: {
        id: questionWithNaNScoreUuid,
      },
    });
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.options.length).toBe(2);

    const nanOptionData = json.options.find(
      (opt: any) => opt.optionId === optionWithNaNScoreUuid,
    );
    expect(nanOptionData).toBeDefined();
    expect(nanOptionData.optionScore).toBeNull();

    const normalOptionData = json.options.find(
      (opt: any) => opt.optionId === optionWithNormalScoreUuid,
    );
    expect(normalOptionData).toBeDefined();
    expect(normalOptionData.optionScore).toBe(0.75);
  });

  it("should correctly return question and its realted data", async () => {
    const req = createMockRequest({
      headers: { "backend-secret": BACKEND_SECRET, source: "crocodile" },
    });
    const res = await GET(req as any, {
      params: {
        id: questionUuid,
      },
    });
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.answers[0].firstOrderOptionId).toBe(questionOptionUuids[1]);
    expect(json.answers[0].secondOrderOptionId).toBe(questionOptionUuids[0]);

    expect(json).toHaveProperty("title");
    expect(json).toHaveProperty("description");
    expect(json).toHaveProperty("type");
    expect(json).toHaveProperty("resolveAt");
    expect(json).toHaveProperty("activeAt");
    expect(json).toHaveProperty("imageUrl");
    expect(json).toHaveProperty("rules");
    expect(json).toHaveProperty("onChainAddress");
    expect(json).toHaveProperty("source");
    expect(json).toHaveProperty("answers");
    expect(json).toHaveProperty("options");
    expect(json).toHaveProperty("bestOption");

    expect(json.options[0].optionId).toBe(questionOptionUuids[0]);
    expect(json.options[1].optionId).toBe(questionOptionUuids[1]);
    expect(json.bestOption).toBe(questionOptionUuids[0]);
  });
});
