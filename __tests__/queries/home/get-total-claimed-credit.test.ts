import { deleteMysteryBoxes } from "@/__tests__/actions/mystery-box.test";
import { getJwtPayload } from "@/app/actions/jwt";
import { getUserTotalCreditAmount } from "@/app/queries/home";
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

describe("getUserTotalCreditAmount", () => {
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

      const box1 = await tx.mysteryBox.create({
        data: {
          userId: user1.id,
          triggers: {
            create: {
              triggerType: EBoxTriggerType.TutorialCompleted,
              MysteryBoxPrize: {
                create: {
                  prizeType: EBoxPrizeType.Credits,
                  amount: "100",
                  size: EPrizeSize.Small,
                  status: EBoxPrizeStatus.Claimed,
                },
              },
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
              MysteryBoxPrize: {
                create: {
                  prizeType: EBoxPrizeType.Credits,
                  amount: "66",
                  size: EPrizeSize.Small,
                  status: EBoxPrizeStatus.Claimed,
                },
              },
            },
          },
        },
      });

      mysteryBox1 = box1.id;
      mysteryBox2 = box2.id;

      const prizeId1 = await tx.mysteryBoxTrigger.findFirstOrThrow({
        where: { mysteryBoxId: box1.id },
        include: {
          MysteryBoxPrize: {
            select: {
              id: true,
            },
          },
        },
      });
      const prizeId2 = await tx.mysteryBoxTrigger.findFirstOrThrow({
        where: { mysteryBoxId: box2.id },
        include: {
          MysteryBoxPrize: {
            select: {
              id: true,
            },
          },
        },
      });

      await tx.fungibleAssetTransactionLog.create({
        data: {
          type: TransactionLogType.MysteryBox,
          asset: FungibleAsset.Credit,
          change: 100,
          userId: user1.id,
          mysteryBoxPrizeId: prizeId1.MysteryBoxPrize[0].id,
        },
      });

      await tx.fungibleAssetTransactionLog.create({
        data: {
          type: TransactionLogType.MysteryBox,
          asset: FungibleAsset.Credit,
          change: 66,
          userId: user1.id,
          mysteryBoxPrizeId: prizeId2.MysteryBoxPrize[0].id,
        },
      });
    });
  });

  afterAll(async () => {
    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: { userId: user1.id },
    });
    await prisma.userBalance.deleteMany({
      where: { userId: user1.id },
    });
    await deleteMysteryBoxes([mysteryBox1, mysteryBox2]);
    await prisma.user.delete({
      where: {
        id: user1.id,
      },
    });
  });

  it("should return the total credit amount ", async () => {
    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user1.id });
    const totalClaimedAmount = await getUserTotalCreditAmount();

    expect(totalClaimedAmount).toBe(166);
  });
});
