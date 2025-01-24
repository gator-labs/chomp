import { getCurrentUser } from "@/app/queries/user";
import prisma from "@/app/services/prisma";
import { decodeJwtPayload } from "@/lib/auth";
import { revokeDynamicSession } from "@/lib/dynamic";
import { UserThreatLevelDetected } from "@/lib/error";
import { getTokenFromCookie } from "@/lib/jwt";
import { generateUsers } from "@/scripts/utils";

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
    users = await generateUsers(2);

    await prisma.user.create({
      data: { id: users[0].id },
    });

    await prisma.user.create({
      data: { id: users[1].id, threatLevel: "bot" },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [users[0].id, users[1].id],
        },
      },
    });
  });

  it("should allow a non-bot user to validate a session", async () => {
    (getTokenFromCookie as jest.Mock).mockResolvedValue("token_123");
    (decodeJwtPayload as jest.Mock).mockResolvedValue({ sub: users[0].id });

    expect(getCurrentUser()).resolves.not.toThrow(UserThreatLevelDetected);
  });

  it("should disallow a bot user to validate a session", async () => {
    // toHaveBeenCalledWith() not working, hence work around
    let revokeCallCount = 0;
    let revokeArg = "";

    (getTokenFromCookie as jest.Mock).mockResolvedValue("token_999");
    (decodeJwtPayload as jest.Mock).mockResolvedValue({ sub: users[1].id });
    (revokeDynamicSession as jest.Mock).mockImplementation(async (token) => {
      revokeArg = token;
      revokeCallCount++;
    });

    const promise = getCurrentUser();

    expect(promise).rejects.toThrow(UserThreatLevelDetected);

    try {
      await promise;
    } catch {}

    expect(revokeCallCount).toEqual(1);
    expect(revokeArg).toEqual(users[1].id);
  });
});
