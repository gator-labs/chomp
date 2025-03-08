import { getJwtPayload } from "@/app/actions/jwt";
import { openMysteryBoxHub } from "@/app/actions/mysteryBox/openMysteryBoxHub";
import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";
import { faker } from "@faker-js/faker";
import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EBoxTriggerType,
  EPrizeSize,
} from "@prisma/client";

jest.mock("p-retry", () => jest.fn().mockImplementation((fn) => fn()));

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));

describe("openMysteryBoxHub", () => {
  let user: { id: string; username: string; wallet: string };
  let user1: { id: string; username: string; wallet: string };
  let mysteryBoxId: string;
  let mysteryBoxId1: string;

  beforeAll(async () => {
    const users = await generateUsers(2);
    user = {
      id: users[0].id,
      username: users[0].username,
      wallet: faker.string.hexadecimal({ length: { min: 32, max: 42 } }),
    };

    user1 = {
      id: users[1].id,
      username: users[1].username,
      wallet: faker.string.hexadecimal({ length: { min: 32, max: 42 } }),
    };

    await prisma.user.createMany({
      data: users,
    });

    await prisma.wallet.createMany({
      data: [{ userId: user.id, address: user.wallet }],
    });

    const mb = await prisma.mysteryBox.create({
      data: {
        userId: user.id,
        triggers: {
          createMany: {
            data: [
              {
                triggerType: EBoxTriggerType.ValidationReward,
              },
            ],
          },
        },
      },

      select: {
        id: true,
        triggers: {
          select: {
            id: true,
          },
        },
      },
    });

    const mb1 = await prisma.mysteryBox.create({
      data: {
        userId: users[1].id,
        triggers: {
          createMany: {
            data: [
              {
                triggerType: EBoxTriggerType.ValidationReward,
              },
            ],
          },
        },
      },

      select: {
        id: true,
        triggers: {
          select: {
            id: true,
          },
        },
      },
    });

    await prisma.mysteryBoxPrize.createMany({
      data: [
        {
          mysteryBoxTriggerId: mb.triggers[0].id,
          status: EBoxPrizeStatus.Unclaimed,
          size: EPrizeSize.Hub,
          prizeType: EBoxPrizeType.Token,
          amount: "0",
        },
        {
          mysteryBoxTriggerId: mb.triggers[0].id,
          status: EBoxPrizeStatus.Unclaimed,
          size: EPrizeSize.Hub,
          prizeType: EBoxPrizeType.Credits,
          amount: "10",
        },
        {
          mysteryBoxTriggerId: mb1.triggers[0].id,
          status: EBoxPrizeStatus.Unclaimed,
          size: EPrizeSize.Hub,
          prizeType: EBoxPrizeType.Token,
          amount: "0",
        },
        {
          mysteryBoxTriggerId: mb1.triggers[0].id,
          status: EBoxPrizeStatus.Unclaimed,
          size: EPrizeSize.Hub,
          prizeType: EBoxPrizeType.Credits,
          amount: "10",
        },
      ],
    });

    mysteryBoxId = mb.id;
    mysteryBoxId1 = mb1.id;
  });

  afterAll(async () => {
    const mysteryBox = await prisma.mysteryBox.findMany({
      where: {
        id: {
          in: [mysteryBoxId, mysteryBoxId1],
        },
      },
      include: {
        triggers: true,
      },
    });

    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: {
        userId: {
          in: [user.id, user1.id],
        },
      },
    });

    const trigger = mysteryBox.flatMap((mb) => mb.triggers);

    await prisma.mysteryBoxPrize.deleteMany({
      where: {
        mysteryBoxTriggerId: {
          in: trigger.map((tgId) => tgId.id),
        },
      },
    });

    await prisma.mysteryBoxTrigger.deleteMany({
      where: {
        id: {
          in: trigger.map((tgId) => tgId.id),
        },
      },
    });

    await prisma.mysteryBox.deleteMany({
      where: {
        id: {
          in: mysteryBox.map((mb) => mb.id),
        },
      },
    });

    await prisma.wallet.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: {
          in: [user.id, user1.id],
        },
      },
    });
  });

  it("should open a mystery box and return the box reward", async () => {
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: user.id,
    });
    const res = await openMysteryBoxHub([mysteryBoxId, mysteryBoxId1]);

    expect(res?.totalBonkAmount).toBe(0);
    expect(res?.totalCreditAmount).toBe(10);
  });
});
