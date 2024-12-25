import { EBoxTriggerType } from "@prisma/client";

import { getJwtPayload } from "../../app/actions/jwt";
import { getNewUserMysteryBoxId } from "../../app/queries/mysteryBox";
import prisma from "../../app/services/prisma";
import { generateUsers } from "../../scripts/utils";

// Mock JWT and Prisma
jest.mock("../../app/actions/jwt");
jest.mock("../../app/services/prisma", () => ({
  __esModule: true,
  default: {
    mysteryBox: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    user: {
      deleteMany: jest.fn(),
    },
    wallet: {
      findFirst: jest.fn(),
    },
  },
}));

describe("getNewUserMysteryBoxId ", () => {
  let user: { id: string; username: string };

  beforeAll(async () => {
    process.env.NEXT_PUBLIC_FF_MYSTERY_BOX_NEW_USER = "true";
    const users = await generateUsers(1);
    user = users[0];
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        id: user.id,
      },
    });
  });

  it("should return null for unauthenticated user", async () => {
    (getJwtPayload as jest.Mock).mockResolvedValue(null);
    const result = await getNewUserMysteryBoxId();
    expect(result).toBeNull();
    expect(getJwtPayload).toHaveBeenCalled();
  });

  it("should return null for non-new user", async () => {
    (getJwtPayload as jest.Mock).mockResolvedValue({
      sub: user.id,
      new_user: false,
    });
    const result = await getNewUserMysteryBoxId();
    expect(result).toBeNull();
    expect(getJwtPayload).toHaveBeenCalled();
  });

  it("should return null if user already has tutorial trigger", async () => {
    (getJwtPayload as jest.Mock).mockResolvedValue({
      sub: user.id,
      new_user: true,
    });
    (prisma.mysteryBox.findFirst as jest.Mock).mockResolvedValue({
      id: "box123",
      userId: user.id,
      triggers: [{ triggerType: EBoxTriggerType.TutorialCompleted }],
    });
    const result = await getNewUserMysteryBoxId();
    expect(result).toBeNull();
    expect(getJwtPayload).toHaveBeenCalled();
    expect(prisma.mysteryBox.findFirst).toHaveBeenCalledWith({
      where: {
        userId: user.id,
        triggers: { some: { triggerType: EBoxTriggerType.TutorialCompleted } },
      },
    });
  });

  it("should create mystery box for eligible new user", async () => {
    const mockMysteryBoxId = "mystery123";
    (getJwtPayload as jest.Mock).mockResolvedValue({
      sub: user.id,
      new_user: true,
    });
    (prisma.mysteryBox.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.wallet.findFirst as jest.Mock).mockResolvedValue({
      id: "wallet123",
      userId: user.id,
    });
    (prisma.mysteryBox.create as jest.Mock).mockResolvedValue({
      id: mockMysteryBoxId,
    });

    const result = await getNewUserMysteryBoxId();

    expect(result).toBe(mockMysteryBoxId);
    expect(getJwtPayload).toHaveBeenCalled();
    expect(prisma.mysteryBox.findFirst).toHaveBeenCalledWith({
      where: {
        userId: user.id,
        triggers: { some: { triggerType: EBoxTriggerType.TutorialCompleted } },
      },
    });
    expect(prisma.mysteryBox.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: user.id,
          triggers: {
            create: {
              triggerType: EBoxTriggerType.TutorialCompleted,
            },
          },
        }),
      }),
    );
  });
});
