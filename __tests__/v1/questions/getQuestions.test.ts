import prisma from "@/app/services/prisma";
import { GET } from "@/app/v1/questions/route";
import { QuestionType, Token } from "@prisma/client";
import dayjs from "dayjs";
import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

const TEST_BACKEND_SECRET = "test-backend-secret-456";
const SOURCE_ONE = "source-alpha";
const SOURCE_TWO = "source-beta";

describe("GET /v1/questions API Endpoint", () => {
  process.env.BACKEND_SECRET = TEST_BACKEND_SECRET;

  // Generate random UUIDs for each test run to avoid collisions
  const questionData = [
    {
      uuid: uuidv4(),
      question: "Is pineapple a valid pizza topping?",
      description: "Settle the age-old debate once and for all.",
      source: SOURCE_ONE,
      type: QuestionType.BinaryQuestion,
      activeFromDate: dayjs("2025-06-01T00:00:00Z").toDate(),
      revealAtDate: null,
      revealToken: Token.Bonk,
      revealTokenAmount: 100,
    },
    {
      uuid: uuidv4(),
      question: "The CIA ran a mind control project called MK-Ultra.",
      description: "From lizard people to leaked documents...",
      source: SOURCE_ONE,
      type: QuestionType.BinaryQuestion,
      activeFromDate: dayjs("2025-05-01T00:00:00Z").toDate(),
      revealAtDate: dayjs("2025-05-02T00:00:00Z").toDate(),
      revealToken: Token.Bonk,
      revealTokenAmount: 200,
    },
    {
      uuid: uuidv4(),
      question: "Is water wet?",
      description: "A classic philosophical question.",
      source: SOURCE_TWO,
      type: QuestionType.BinaryQuestion,
      activeFromDate: dayjs().subtract(1, "day").toDate(),
      revealAtDate: dayjs().add(1, "day").toDate(),
      revealToken: Token.Bonk,
      revealTokenAmount: 5,
    },
  ];

  let createdQuestionsDb: any[] = [];

  beforeAll(async () => {
    // Clean up any existing test questions first
    await prisma.question.deleteMany({
      where: {
        source: {
          in: [SOURCE_ONE, SOURCE_TWO],
        },
      },
    });

    // Then create our test questions
    createdQuestionsDb = await Promise.all(
      questionData.map((qData) => prisma.question.create({ data: qData })),
    );
  });

  afterAll(async () => {
    const questionIds = createdQuestionsDb.map((q) => q.id);
    await prisma.questionAnswer.deleteMany({
      where: { questionOption: { questionId: { in: questionIds } } },
    });
    await prisma.questionOption.deleteMany({
      where: { questionId: { in: questionIds } },
    });
    await prisma.deckQuestion.deleteMany({
      where: { questionId: { in: questionIds } },
    });
    await prisma.question.deleteMany({ where: { id: { in: questionIds } } });
    delete process.env.BACKEND_SECRET;
  });

  async function makeRequest(customHeaders: Record<string, string> = {}) {
    const headers = new Headers({
      "backend-secret": TEST_BACKEND_SECRET,
      source: SOURCE_ONE,
      ...customHeaders,
    });

    const mockRequest = {
      headers,
    } as unknown as NextRequest;

    return GET(mockRequest);
  }

  it("should return 401 if no backend-secret is provided", async () => {
    const mockRequest = {
      headers: new Headers({
        source: SOURCE_ONE,
      }),
    } as unknown as NextRequest;

    const response = await GET(mockRequest);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 401 if incorrect backend-secret is provided", async () => {
    const mockRequest = {
      headers: new Headers({
        "backend-secret": "wrong-secret",
        source: SOURCE_ONE,
      }),
    } as unknown as NextRequest;

    const response = await GET(mockRequest);
    expect(response.status).toBe(401);
  });

  it("should return 400 if no source header is provided", async () => {
    const mockRequest = {
      headers: new Headers({
        "backend-secret": TEST_BACKEND_SECRET,
      }),
    } as unknown as NextRequest;

    const response = await GET(mockRequest);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("missing_source_header");
  });

  it("should return questions for a specific source (SOURCE_ONE)", async () => {
    const response = await makeRequest({ source: SOURCE_ONE });
    expect(response.status).toBe(200);
    const questions = await response.json();
    const expectedQuestions = questionData.filter(
      (q) => q.source === SOURCE_ONE,
    );
    expect(questions.length).toBe(expectedQuestions.length);
    questions.forEach((q: any) => expect(q.title).toBeDefined()); // Basic check
    expectedQuestions.forEach((expQ) => {
      const found = questions.find((q: any) => q.questionId === expQ.uuid);
      expect(found).toBeDefined();
      expect(found.title).toEqual(expQ.question);
    });
  });

  it("should return questions for a specific source (SOURCE_TWO)", async () => {
    const response = await makeRequest({ source: SOURCE_TWO });
    expect(response.status).toBe(200);
    const questions = await response.json();
    const expectedQuestions = questionData.filter(
      (q) => q.source === SOURCE_TWO,
    );
    expect(questions.length).toBe(expectedQuestions.length);
    expectedQuestions.forEach((expQ) => {
      const found = questions.find((q: any) => q.questionId === expQ.uuid);
      expect(found).toBeDefined();
      expect(found.title).toEqual(expQ.question);
    });
  });

  it("should return an empty array if source has no questions", async () => {
    const response = await makeRequest({ source: "non-existent-source" });
    expect(response.status).toBe(200);
    const questions = await response.json();
    expect(questions).toEqual([]);
  });

  it("should return all questions for a source, ordered by activeFromDate descending", async () => {
    const response = await makeRequest({ source: SOURCE_ONE });
    expect(response.status).toBe(200);
    const questions = await response.json();
    const expectedQuestions = questionData.filter(
      (q) => q.source === SOURCE_ONE,
    );
    expect(questions.length).toBe(expectedQuestions.length);

    // Verify content and order (assuming activeFromDate is correctly used by getQuestions)
    const sortedExpected = expectedQuestions.sort(
      (a, b) => b.activeFromDate.getTime() - a.activeFromDate.getTime(),
    );
    questions.forEach((fetchedQ: any, index: number) => {
      expect(fetchedQ.questionId).toBe(sortedExpected[index].uuid);
      expect(fetchedQ.title).toBe(sortedExpected[index].question);
    });

    if (questions.length >= 2) {
      const date1 = questions[0].activeAt
        ? new Date(questions[0].activeAt).getTime()
        : 0;
      const date2 = questions[1].activeAt
        ? new Date(questions[1].activeAt).getTime()
        : 0;
      expect(date1).toBeGreaterThanOrEqual(date2);
    }
  });

  // Test for the "empty database for a source" scenario is implicitly covered by "source has no questions"
  // The test for "empty array if no questions exist overall" is more complex with source filtering.
  // The most direct test for an empty array is providing a source that yields no results.
});
