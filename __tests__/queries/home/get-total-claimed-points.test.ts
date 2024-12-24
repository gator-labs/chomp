import { getJwtPayload } from "@/app/actions/jwt";
import { getUserTotalPoints } from "@/app/queries/home";
import prisma from "@/app/services/prisma";
import { FungibleAsset, TransactionLogType } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}));
jest.mock("p-retry", () => ({
  retry: jest.fn((fn) => fn()),
}));

describe("getUserTotalPoints", () => {
  const user1 = {
    id: uuidv4(),
  };

  beforeAll(async () => {
    await prisma.$transaction(async (tx) => {
      // Create users
      await tx.user.create({
        data: {
          id: user1.id,
        },
      });

      await tx.fungibleAssetTransactionLog.create({
        data: {
          type: TransactionLogType.ConnectX,
          asset: FungibleAsset.Point,
          change: 100,
          userId: user1.id,
        },
      });

      await tx.fungibleAssetTransactionLog.create({
        data: {
          type: TransactionLogType.ConnectTelegram,
          asset: FungibleAsset.Point,
          change: 100,
          userId: user1.id,
        },
      });
    });
  });

  afterAll(async () => {
    try {
      await prisma.fungibleAssetTransactionLog.deleteMany({
        where: { userId: user1.id },
      });
      await prisma.user.delete({
        where: {
          id: user1.id,
        },
      });
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  });

  it("should return the total point amount ", async () => {
    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user1.id });
    const totalClaimedAmount = await getUserTotalPoints();

    expect(totalClaimedAmount).toBe(200);
  });
});
