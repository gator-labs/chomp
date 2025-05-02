import prisma from "@/app/services/prisma";
import { POST } from "@/app/v1/questions/route";

jest.mock("@/app/services/prisma", () => ({
  question: {
    create: jest.fn(),
  },
}));

jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-uuid"),
}));

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
  beforeAll(() => {
    process.env.BACKEND_SECRET = BACKEND_SECRET;
  });

  afterEach(() => {
    jest.clearAllMocks();
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
        options: [
          { title: "A", index: 0 },
          { title: "B", index: 1 },
        ],
      },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("question_invalid");
  });

  it("returns 400 for invalid number of options", async () => {
    const req = createMockRequest({
      headers: { "backend-secret": BACKEND_SECRET },
      body: {
        title: "Test",
        options: [{ title: "A", index: 0 }], // only 1 option
      },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("question_invalid");
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
    (prisma.question.create as jest.Mock).mockResolvedValue({
      uuid: "mock-uuid",
      questionOptions: [
        { index: 0, uuid: "option-uuid-0" },
        { index: 1, uuid: "option-uuid-1" },
      ],
    });

    const req = createMockRequest({
      headers: { "backend-secret": BACKEND_SECRET },
      body: mockBody,
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toEqual({
      id: "mock-uuid",
      options: [
        { index: 0, uuid: "option-uuid-0" },
        { index: 1, uuid: "option-uuid-1" },
      ],
    });
  });
});
