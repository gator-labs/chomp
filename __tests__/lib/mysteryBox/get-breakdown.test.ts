import { deleteDeck } from "@/app/actions/deck/deck";
import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { getMysteryBoxBreakdown } from "@/lib/mysteryBox/getBreakdown";
import { generateUsers } from "@/scripts/utils";
import { faker } from "@faker-js/faker";
import { EBoxPrizeStatus, EMysteryBoxStatus } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

jest.mock("@/lib/mysteryBox", () => ({
  ...jest.requireActual("@/lib/mysteryBox"),
  sendBonkFromTreasury: jest.fn(async () =>
    faker.string.hexadecimal({ length: 86 }),
  ),
}));

jest.mock("@/actions/getTreasuryAddress", () => ({
  getTreasuryAddress: jest.fn(async () =>
    faker.string.hexadecimal({ length: 40 }),
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

export async function deleteMysteryBoxes(mysteryBoxIds: string[]) {
  // Filter out null/undefined values and ensure valid mysteryBoxIds
  const validBoxIds = mysteryBoxIds.filter(
    (id): id is string => id !== null && id !== undefined,
  );

  const boxes = await prisma.mysteryBox.findMany({
    where: {
      id: { in: validBoxIds },
    },
    include: {
      triggers: {
        select: {
          id: true,
          MysteryBoxPrize: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });
  await prisma.mysteryBoxPrize.deleteMany({
    where: {
      id: {
        in: boxes.flatMap((box) =>
          box.triggers.flatMap((trigger) =>
            trigger.MysteryBoxPrize.map((prize) => prize.id),
          ),
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
      id: { in: validBoxIds },
    },
  });
}

describe("Create mystery box", () => {
  const currentDate = new Date();

  let user0: { id: string; username: string; wallet: string };
  let user1: { id: string; username: string; wallet: string };
  let questionIds: number[];
  let deckId: number;
  let mysteryBoxId: string | null;

  beforeAll(async () => {
    const question = {
      create: {
        stackId: null,
        question: "Bonkaton question?",
        type: "MultiChoice",
        revealTokenAmount: 10,
        revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        durationMiliseconds: BigInt(60000),
        questionOptions: {
          create: [
            {
              option: "A",
              isCorrect: true,
              isLeft: false,
            },
            {
              option: "B",
              isCorrect: false,
              isLeft: false,
            },
            {
              option: "C",
              isCorrect: false,
              isLeft: false,
            },
            {
              option: "D",
              isCorrect: false,
              isLeft: false,
            },
          ],
        },
      },
    };

    const deck = await prisma.deck.create({
      data: {
        deck: `deck ${currentDate}`,
        revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        stackId: null,
        deckQuestions: {
          create: Array(5).fill({ question }),
        },
      },
      include: {
        deckQuestions: true,
      },
    });

    questionIds = deck.deckQuestions.map((q) => q.questionId);
    deckId = deck.id;

    const users = await generateUsers(1);

    user0 = {
      id: users[0].id,
      username: users[0].username,
      wallet: faker.string.hexadecimal({ length: { min: 32, max: 42 } }),
    };

    await prisma.user.createMany({
      data: users,
    });

    await prisma.wallet.createMany({
      data: [{ userId: user0.id, address: user0.wallet }],
    });

    const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

    const res = await prisma.mysteryBox.create({
      data: {
        userId: user0.id,
        status: EMysteryBoxStatus.Opened,
      },
    });

    await prisma.mysteryBoxTrigger.create({
      data: {
        questionId: questionIds[3],
        triggerType: "ValidationReward",
        mysteryBoxId: res.id,
        MysteryBoxPrize: {
          createMany: {
            data: [
              {
                status: EBoxPrizeStatus.Claimed,
                claimedAt: new Date(),
                size: "Small",
                prizeType: "Token",
                tokenAddress: bonkAddress,
                amount: "4500",
              },
              {
                status: EBoxPrizeStatus.Claimed,
                claimedAt: new Date(),
                size: "Small",
                prizeType: "Credits",
                amount: "5",
              },
            ],
          },
        },
      },
    });

    mysteryBoxId = res.id;

    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user0.id });
  });

  afterAll(async () => {
    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: { userId: user0.id },
    });

    await deleteDeck(deckId);

    await deleteMysteryBoxes(
      [mysteryBoxId].filter((box) => box !== null && box !== undefined),
    );

    // Delete the actuall wallets
    await prisma.wallet.deleteMany({
      where: {
        userId: { in: [user0.id] },
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: { in: [user0.id] },
      },
    });

    await prisma.mysteryBoxAllowlist.deleteMany({
      where: {
        address: { in: [user0.wallet] },
      },
    });
  });

  it("should get the mystery box breakdown", async () => {
    const breakdown = await getMysteryBoxBreakdown(user0.id, mysteryBoxId!);
    expect(breakdown).toBeDefined();
    expect(breakdown.length).toBe(1);
    expect(breakdown?.[0].id).toBe(deckId);
    expect(breakdown?.[0].bonkReceived).toBe(4500);
    expect(breakdown?.[0].creditsReceived).toBe(5);
  });

  it("should not get an invalid mystery box", async () => {
    const invalidId = uuidv4();
    await expect(getMysteryBoxBreakdown(user0.id, invalidId)).rejects.toThrow(
      /not found/,
    );
  });

  it("should not get the mystery box breakdown for another user", async () => {
    const otherUsers = await generateUsers(1);
    await expect(
      getMysteryBoxBreakdown(otherUsers[0].id, mysteryBoxId!),
    ).rejects.toThrow(/not found/);
  });
});
