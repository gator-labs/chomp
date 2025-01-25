import prisma from "@/app/services/prisma";
import { findMysteryBox, rewardChompmasBox } from "@/lib/mysteryBox";
import { getChompmasMysteryBox } from "@/lib/mysteryBox";
import { generateUsers } from "@/scripts/utils";
import { faker } from "@faker-js/faker";
import { EBoxTriggerType, EMysteryBoxStatus } from "@prisma/client";

jest.mock("@/lib/mysteryBox", () => ({
  ...jest.requireActual("@/lib/mysteryBox"),
  sendBonkFromTreasury: jest.fn(async () =>
    faker.string.hexadecimal({ length: 88 }),
  ),
}));

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));
jest.mock("p-retry", () => jest.fn().mockImplementation((fn) => fn()));

async function deleteMysteryBoxes(mysteryBoxIds: string[]) {
  const boxes = await prisma.mysteryBox.findMany({
    where: {
      id: { in: mysteryBoxIds },
    },
    include: {
      triggers: true,
      MysteryBoxPrize: true,
    },
  });
  await prisma.mysteryBoxPrize.deleteMany({
    where: {
      id: {
        in: boxes.flatMap((box) =>
          box.MysteryBoxPrize.map((prize) => prize.id),
        ),
      },
    },
  });
  await prisma.mysteryBoxTrigger.deleteMany({
    where: {
      id: { in: boxes.flatMap((box) => box.triggers.map((prize) => prize.id)) },
    },
  });
  await prisma.mysteryBox.deleteMany({
    where: {
      id: { in: mysteryBoxIds },
    },
  });
}

describe("Chompmas mystery boxes", () => {
  let user0: { id: string; username: string; wallet: string };
  let user1: { id: string; username: string; wallet: string };
  let user2: { id: string; username: string; wallet: string };

  let mysteryBoxId: string | null;

  beforeAll(async () => {
    const users = await generateUsers(3);

    user0 = {
      id: users[0].id,
      username: users[0].username,
      wallet: faker.string.hexadecimal({ length: { min: 32, max: 42 } }),
    };
    user1 = {
      id: users[1].id,
      username: users[1].username,
      wallet: faker.string.hexadecimal({ length: { min: 32, max: 42 } }),
    };
    user2 = {
      id: users[2].id,
      username: users[2].username,
      wallet: faker.string.hexadecimal({ length: { min: 32, max: 42 } }),
    };

    await prisma.user.createMany({
      data: users,
    });

    await prisma.wallet.createMany({
      data: [
        { userId: user0.id, address: user0.wallet },
        { userId: user1.id, address: user1.wallet },
        { userId: user2.id, address: user2.wallet },
      ],
    });
  });

  afterAll(async () => {
    await prisma.wallet.deleteMany({
      where: {
        userId: { in: [user0.id, user1.id, user2.id] },
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: { in: [user0.id, user1.id, user2.id] },
      },
    });

    await prisma.mysteryBoxAllowlist.deleteMany({
      where: {
        address: { in: [user0.wallet, user1.wallet, user2.wallet] },
      },
    });
  });

  it("Should reward a chompmas mystery box", async () => {
    await prisma.mysteryBoxAllowlist.create({
      data: { address: user1.wallet },
    });

    mysteryBoxId = await rewardChompmasBox(user1.id);

    expect(mysteryBoxId).toBeDefined();

    if (mysteryBoxId) {
      const res = await prisma.mysteryBox.findUnique({
        where: {
          id: mysteryBoxId,
        },
        include: {
          triggers: true,
          MysteryBoxPrize: true,
        },
      });

      expect(res).toBeDefined();
      expect(res?.userId).toEqual(user1.id);
      expect(res?.id).toBe(mysteryBoxId);
      expect(res?.status).toBe("New");
      expect(res?.triggers).toHaveLength(1);
      expect(res?.triggers?.[0]?.triggerType).toEqual(
        EBoxTriggerType.ChompmasStreakAttained,
      );
      expect(res?.MysteryBoxPrize).toHaveLength(1);
    }
  });

  it("Should find the previously awarded chompmas mystery box", async () => {
    const box = await findMysteryBox(
      user1.id,
      EBoxTriggerType.ChompmasStreakAttained,
    );

    expect(box?.id).toEqual(mysteryBoxId);
    expect(box?.status).toEqual(EMysteryBoxStatus.New);

    if (mysteryBoxId) {
      await deleteMysteryBoxes([mysteryBoxId]);
      mysteryBoxId = null;
    }
  });

  it("Should refuse a chompmas box for user without a streak", async () => {
    await prisma.mysteryBoxAllowlist.create({
      data: { address: user2.wallet },
    });

    const boxId = await getChompmasMysteryBox(
      user2.id,
      Number(process.env.NEXT_PUBLIC_CHOMPMAS_MIN_STREAK!) - 1,
    );

    expect(boxId).toBeNull();
  });

  it("Should create a chompmas box for user with a streak", async () => {
    mysteryBoxId = await getChompmasMysteryBox(
      user1.id,
      Number(process.env.NEXT_PUBLIC_CHOMPMAS_MIN_STREAK!),
    );

    expect(mysteryBoxId).toBeDefined();

    if (!mysteryBoxId) throw new Error("Mystery box not defined");

    const res = await prisma.mysteryBox.findUnique({
      where: {
        id: mysteryBoxId!,
      },
      include: {
        triggers: true,
        MysteryBoxPrize: true,
      },
    });

    expect(res?.id).toBe(mysteryBoxId);
    expect(res?.status).not.toBe("Unopened");
    expect(res?.triggers?.length).toBe(1);
    expect(res?.triggers?.[0]?.triggerType).toBe(
      EBoxTriggerType.ChompmasStreakAttained,
    );
  });

  it("Should return the existing box", async () => {
    const boxId = await getChompmasMysteryBox(
      user1.id,
      Number(process.env.NEXT_PUBLIC_CHOMPMAS_MIN_STREAK!),
    );

    expect(boxId).toEqual(mysteryBoxId);
  });

  it("Should not return the box after it was opened", async () => {
    if (!mysteryBoxId) throw new Error("Mystery box not defined");

    await prisma.mysteryBox.update({
      where: {
        id: mysteryBoxId!,
      },
      data: {
        status: EMysteryBoxStatus.Opened,
      },
    });

    const boxId = await getChompmasMysteryBox(
      user1.id,
      Number(process.env.NEXT_PUBLIC_CHOMPMAS_MIN_STREAK!),
    );

    expect(boxId).not.toEqual(mysteryBoxId);

    if (boxId) await deleteMysteryBoxes([boxId]);
    if (mysteryBoxId) await deleteMysteryBoxes([mysteryBoxId]);
  });
});
