import { getCurrentUser } from "@/app/queries/user";
import prisma from "@/app/services/prisma";
import { decodeJwtPayload } from "@/lib/auth";
import { UserThreatLevelDetected } from "@/lib/error";
import { getTokenFromCookie } from "@/lib/jwt";
import { generateUsers } from "@/scripts/utils";
import { EThreatLevelType } from "@/types/bots";

jest.mock("@/lib/auth", () => {
  return {
    decodeJwtPayload: jest.fn(),
  };
});

jest.mock("@/lib/jwt", () => {
  const orig = jest.requireActual("@/lib/jwt");
  return {
    ...orig,
    getTokenFromCookie: jest.fn(),
  };
});

jest.mock("@/lib/dynamic", () => ({
  revokeDynamicSession: jest.fn(),
}));

describe("Threat level blocking", () => {
  let users: { username: string; id: string }[];

  beforeAll(async () => {
    users = await generateUsers(5);

    await prisma.user.createMany({
      data: [
        { id: users[0].id },
        { id: users[1].id, threatLevel: EThreatLevelType.Bot },
        { id: users[2].id, threatLevel: EThreatLevelType.ManualAllow },
        { id: users[3].id, threatLevel: EThreatLevelType.ManualBlock },
        { id: users[4].id, threatLevel: EThreatLevelType.PermanentAllow },
      ],
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [users[0].id, users[1].id, users[2].id, users[3].id, users[4].id],
        },
      },
    });
  });

  it("should allow a non-bot user to validate a session", async () => {
    (getTokenFromCookie as jest.Mock).mockResolvedValue("token_123");
    (decodeJwtPayload as jest.Mock).mockResolvedValue({ sub: users[0].id });

    await expect(getCurrentUser()).resolves.not.toThrow(UserThreatLevelDetected);
  });

  it("should disallow a bot user to validate a session", async () => {
    // toHaveBeenCalledWith() not working, hence work around
    (getTokenFromCookie as jest.Mock).mockResolvedValue("token_999");
    (decodeJwtPayload as jest.Mock).mockResolvedValue({ sub: users[1].id });

    await expect(getCurrentUser()).rejects.toThrow(UserThreatLevelDetected);
  });

  it("should allow a manually-permitted 'bot' to validate a session", async () => {
    (getTokenFromCookie as jest.Mock).mockResolvedValue("token_888");
    (decodeJwtPayload as jest.Mock).mockResolvedValue({ sub: users[2].id });

    await expect(getCurrentUser()).resolves.not.toThrow(UserThreatLevelDetected);
  });

  it("should disallow a manually-blocked user to validate a session", async () => {
    // toHaveBeenCalledWith() not working, hence work around
    (getTokenFromCookie as jest.Mock).mockResolvedValue("token_777");
    (decodeJwtPayload as jest.Mock).mockResolvedValue({ sub: users[3].id });

    await expect(getCurrentUser()).rejects.toThrow(UserThreatLevelDetected);
  });

  it("should allow a permanently-allowed user to validate a session", async () => {
    // toHaveBeenCalledWith() not working, hence work around
    (getTokenFromCookie as jest.Mock).mockResolvedValue("token_222");
    (decodeJwtPayload as jest.Mock).mockResolvedValue({ sub: users[4].id });

    await expect(getCurrentUser()).resolves.not.toThrow(UserThreatLevelDetected);
  });
});
