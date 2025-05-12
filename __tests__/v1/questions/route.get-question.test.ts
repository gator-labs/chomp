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
    console.log(json);

    expect(json).toHaveProperty("answers");
    expect(json).toHaveProperty("options");
    expect(json).toHaveProperty("bestOption");

    expect(json.options[0].optionId).toBe(questionOptionUuids[0]);
    expect(json.options[1].optionId).toBe(questionOptionUuids[1]);
    expect(json.bestOption).toBe(questionOptionUuids[0]);
  });
});
