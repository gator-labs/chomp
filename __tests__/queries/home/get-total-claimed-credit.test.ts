import { deleteMysteryBoxes } from "@/__tests__/actions/mystery-box.test";
import { getJwtPayload } from "@/app/actions/jwt";
import { getUsersTotalCreditAmount } from "@/app/queries/home";
import prisma from "@/app/services/prisma";
import { FungibleAsset, TransactionLogType } from "@prisma/client";
import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EBoxTriggerType,
  EPrizeSize,
} from "@prisma/client";
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

describe("getUsersTotalCreditAmount", () => {
  const user1 = {
    id: uuidv4(),
  };
  let mysteryBox1: string;
  let mysteryBox2: string;

  beforeAll(async () => {
    await prisma.$transaction(async (tx) => {
      // Create users
      await tx.user.create({
        data: {
          id: user1.id,
        },
      });

      const box = await tx.mysteryBox.create({
        data: {
          userId: user1.id,
          triggers: {
            create: {
              triggerType: EBoxTriggerType.TutorialCompleted,
            },
          },
          MysteryBoxPrize: {
            create: {
              prizeType: EBoxPrizeType.Credits,
              amount: "100",
              size: EPrizeSize.Small,
              status: EBoxPrizeStatus.Claimed,
            },
          },
        },
      });

      const box2 = await tx.mysteryBox.create({
        data: {
          userId: user1.id,
          triggers: {
            create: {
              triggerType: EBoxTriggerType.TutorialCompleted,
            },
          },
          MysteryBoxPrize: {
            create: {
              prizeType: EBoxPrizeType.Credits,
              amount: "66",
              size: EPrizeSize.Small,
              status: EBoxPrizeStatus.Claimed,
            },
          },
        },
      });

      mysteryBox1 = box.id;
      mysteryBox2 = box2.id;

      await tx.fungibleAssetTransactionLog.create({
        data: {
          type: TransactionLogType.MysteryBox,
          asset: FungibleAsset.Credit,
          change: 100,
          userId: user1.id,
          mysteryBoxId: mysteryBox1,
        },
      });

      await tx.fungibleAssetTransactionLog.create({
        data: {
          type: TransactionLogType.MysteryBox,
          asset: FungibleAsset.Credit,
          change: 66,
          userId: user1.id,
          mysteryBoxId: mysteryBox2,
        },
      });
    });
  });

  afterAll(async () => {
    try {
      await prisma.fungibleAssetTransactionLog.deleteMany({
        where: { userId: user1.id },
      });
      await deleteMysteryBoxes([mysteryBox1, mysteryBox2]);
      await prisma.user.delete({
        where: {
          id: user1.id,
        },
      });
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  });

  it("should return the total credit amount ", async () => {
    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user1.id });
    const totalClaimedAmount = await getUsersTotalCreditAmount();

    expect(totalClaimedAmount).toBe(166);
  });
});
