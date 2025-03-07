import { GET } from "@/app/api/cron/detect-bot-activity/route";
import prisma from "@/app/services/prisma";
import { queryBotDetector } from "@/lib/bot-detector";
import { generateUsers } from "@/scripts/utils";
import { EThreatLevelType } from "@/types/bots";

const secret = process.env.CRON_SECRET || "";

jest.mock("p-retry", () => jest.fn().mockImplementation((fn) => fn()));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/bot-detector", () => ({
  queryBotDetector: jest.fn(),
}));

describe("GET /api/cron/detect-bot-activity", () => {
  let users: { id: string; username: string }[];

  beforeAll(async () => {
    users = await generateUsers(1);

    await prisma.user.createMany({
      data: users,
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        id: { in: users.map((user) => user.id) },
      },
    });
  });

  it("should apply bot detection result", async () => {
    const mockHeaders = {
      get: jest.fn().mockReturnValue(`Bearer ${secret}`),
    };

    const mockRequest = {
      headers: mockHeaders,
    } as unknown as Request;

    (queryBotDetector as jest.Mock).mockResolvedValue({
      start_date: "2025-01-01",
      end_date: "2025-01-03",
      mean_bot_score: {
        [users[0].id]: "99",
      },
    });

    await GET(mockRequest);

    const userRecord = await prisma.user.findUnique({
      where: {
        id: users[0].id,
      },
    });

    expect(userRecord?.threatLevel).toEqual(EThreatLevelType.Bot);
    expect(userRecord?.threatLevelWindow?.toISOString()).toEqual(
      "2025-01-03T00:00:00.000Z",
    );
  });

  it("should skip user in same threat level window", async () => {
    await prisma.user.update({
      data: {
        threatLevel: EThreatLevelType.ManualAllow,
      },
      where: {
        id: users[0].id,
      },
    });

    const mockHeaders = {
      get: jest.fn().mockReturnValue(`Bearer ${secret}`),
    };

    const mockRequest = {
      headers: mockHeaders,
    } as unknown as Request;

    (queryBotDetector as jest.Mock).mockResolvedValue({
      start_date: "2025-01-01",
      end_date: "2025-01-04",
      mean_bot_score: {
        [users[0].id]: "99",
      },
    });

    await GET(mockRequest);

    const userRecord = await prisma.user.findUnique({
      where: {
        id: users[0].id,
      },
    });

    // Unchanged since we're in the same window
    expect(userRecord?.threatLevel).toEqual(EThreatLevelType.ManualAllow);
    expect(userRecord?.threatLevelWindow?.toISOString()).toEqual(
      "2025-01-03T00:00:00.000Z",
    );
  });

  it("should update reoffending user now threat level window has changed", async () => {
    await prisma.user.update({
      data: {
        threatLevel: EThreatLevelType.ManualAllow,
      },
      where: {
        id: users[0].id,
      },
    });

    const mockHeaders = {
      get: jest.fn().mockReturnValue(`Bearer ${secret}`),
    };

    const mockRequest = {
      headers: mockHeaders,
    } as unknown as Request;

    (queryBotDetector as jest.Mock).mockResolvedValue({
      start_date: "2025-01-08",
      end_date: "2025-01-10",
      mean_bot_score: {
        [users[0].id]: "99",
      },
    });

    await GET(mockRequest);

    const userRecord = await prisma.user.findUnique({
      where: {
        id: users[0].id,
      },
    });

    // Outside of window, so now updated.
    expect(userRecord?.threatLevel).toEqual(EThreatLevelType.Bot);
    expect(userRecord?.threatLevelWindow?.toISOString()).toEqual(
      "2025-01-10T00:00:00.000Z",
    );
  });
});
