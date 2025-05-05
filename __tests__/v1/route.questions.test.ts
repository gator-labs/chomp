import prisma from "@/app/services/prisma";
import { POST } from "@/app/v1/questions/route";
import { v4 as uuidv4 } from "uuid";

// Helper to create a mock NextRequest
function createMockRequest({
  headers = {},
  body = {},
}: {
  headers: any;
  body?: any;
}) {
  return {
    headers: {
      get: (key: any) => headers[key.toLowerCase()] || null,
    },
    json: async () => body,
  };
}

describe("POST /v1/questions", () => {
  const BACKEND_SECRET = "test-secret";
  let questionUuid: string;
  beforeAll(() => {
    process.env.BACKEND_SECRET = BACKEND_SECRET;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    const res = await prisma.question.findFirst({
      where: {
        uuid: questionUuid,
      },
      include: {
        questionOptions: true,
      },
    });
    await prisma.questionOption.deleteMany({
      where: {
        id: {
          in: res?.questionOptions.map((qo) => qo.id),
        },
      },
    });

    await prisma.question.delete({
      where: { id: res?.id },
    });
  });

  it("returns 401 if backend-secret is missing or incorrect", async () => {
    const req = createMockRequest({ headers: {} });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({ error: "Unauthorized" });
  });

  it("returns 400 if validation fails (missing title)", async () => {
    const req = createMockRequest({
      headers: { "backend-secret": BACKEND_SECRET },
      body: {
        description: "desc",
        options: [
          { title: "A", index: 0 },
          { title: "B", index: 1 },
        ],
        activeAt: new Date().toISOString(),
      },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("question_invalid");
    expect(json.message).toBe("Title must be defined");
  });

  it("returns 400 for invalid number of options", async () => {
    const req = createMockRequest({
      headers: { "backend-secret": BACKEND_SECRET },
      body: {
        title: "Test Q",
        description: "desc",
        options: [{ title: "A", index: 0 }],
        activeAt: new Date().toISOString(),
      },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("option_invalid");
    expect(json.message).toBe("Array must have exactly 2 or 4 options");
  });

  it("creates a question and returns id/options on success", async () => {
    const now = new Date();
    const mockBody = {
      title: "Test Q",
      description: "desc",
      options: [
        { title: "title", index: 1 },
        { title: "title", index: 2 },
      ],
      resolveAt: new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString(),
      activeAt: new Date().toISOString(),
    };

    const source = `v1-questions-test-${uuidv4()}`;

    const req = createMockRequest({
      headers: {
        "backend-secret": BACKEND_SECRET,
        source: source,
      },
      body: mockBody,
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);

    const json = await res.json();

    questionUuid = json.uuid;

    const getQuestion = await prisma.question.findFirst({
      where: {
        source: source,
      },
      include: {
        questionOptions: {
          select: {
            index: true,
            uuid: true,
          },
        },
      },
    });

    expect(json).toEqual({
      questionId: getQuestion?.uuid,
      options: getQuestion?.questionOptions.map(({ index, uuid }) => ({
        index,
        optionId: uuid,
      })),
    });
  });
});
