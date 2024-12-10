import { deleteDeck } from "@/app/actions/deck/deck";
import { getJwtPayload } from "@/app/actions/jwt";
import { dismissMysteryBox } from "@/app/actions/mysteryBox/dismiss";
import { openMysteryBox } from "@/app/actions/mysteryBox/open";
import { revealMysteryBox } from "@/app/actions/mysteryBox/reveal";
import prisma from "@/app/services/prisma";
import { rewardMysteryBox } from "@/lib/mysteryBox";
import { calculateTotalPrizeTokens } from "@/lib/mysteryBox";
import { sendBonkFromTreasury } from "@/lib/mysteryBox";
import { generateUsers } from "@/scripts/utils";
import { MysteryBoxEventsType } from "@/types/mysteryBox";
import { faker } from "@faker-js/faker";
import {
  EBoxPrizeStatus,
  EBoxTriggerType,
  EMysteryBoxStatus,
} from "@prisma/client";

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

describe("Create mystery box", () => {
  const currentDate = new Date();

  let user0: { id: string; username: string; wallet: string };
  let user1: { id: string; username: string; wallet: string };
  let questionIds: number[];
  let deckId: number;
  let mysteryBoxId: string | null;
  let mysteryBoxId2: string | null;
  let mysteryBoxId3: string | null;
  let mysteryBoxId4: string | null;

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
          create: Array(4).fill({ question }),
        },
      },
      include: {
        deckQuestions: true,
      },
    });

    questionIds = deck.deckQuestions.map((q) => q.questionId);
    deckId = deck.id;

    const users = await generateUsers(2);

    user0 = {
      id: users[0].id,
      username: users[0].username,
      wallet: faker.string.hexadecimal({ length: { min: 32, max: 44 } }),
    };
    user1 = {
      id: users[1].id,
      username: users[1].username,
      wallet: faker.string.hexadecimal({ length: { min: 32, max: 44 } }),
    };

    await prisma.user.createMany({
      data: users,
    });

    await prisma.wallet.createMany({
      data: [
        { userId: user0.id, address: user0.wallet },
        { userId: user1.id, address: user1.wallet },
      ],
    });

    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user0.id });
  });

  afterAll(async () => {
    await deleteDeck(deckId);

    await deleteMysteryBoxes(
      [mysteryBoxId, mysteryBoxId2, mysteryBoxId3, mysteryBoxId4].filter(
        (box) => box !== null && box !== undefined,
      ),
    );

    await prisma.wallet.deleteMany({
      where: {
        userId: { in: [user0.id, user1.id] },
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: { in: [user0.id, user1.id] },
      },
    });
  });

  it("Should create a new mystery box with triggers and prizes", async () => {
    mysteryBoxId = await rewardMysteryBox(
      user0.id,
      EBoxTriggerType.ClaimAllCompleted,
      [questionIds[0]],
    );
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
      // Assertions
      expect(res).toBeDefined();
      expect(res?.id).toBe(mysteryBoxId);
      expect(res?.status).toBe("New");
      expect(res?.triggers).toHaveLength(1);
      expect(res?.MysteryBoxPrize).toHaveLength(1);
    }
  });

  it("Should calculate the user's total token winnings", async () => {
    // Create a second box
    mysteryBoxId2 = await rewardMysteryBox(
      user0.id,
      EBoxTriggerType.ClaimAllCompleted,
      [questionIds[1]],
    );

    if (!mysteryBoxId || !mysteryBoxId2)
      throw new Error("Missing mystery box id(s)");

    await prisma.mysteryBoxPrize.updateMany({
      where: { mysteryBoxId: { in: [mysteryBoxId, mysteryBoxId2] } },
      data: {
        status: EBoxPrizeStatus.Claimed,
        amount: "2300",
      },
    });

    const totalWon = await calculateTotalPrizeTokens(
      user0.id,
      process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "",
    );

    expect(Number(totalWon)).toEqual(4600);
  });

  it("Should dismiss a mystery box", async () => {
    // Create a second box
    mysteryBoxId3 = await rewardMysteryBox(
      user0.id,
      EBoxTriggerType.ClaimAllCompleted,
      [questionIds[2]],
    );

    if (!mysteryBoxId3) throw new Error("Error creating mystery box");

    await dismissMysteryBox(mysteryBoxId3);

    const res = await prisma.mysteryBox.findUnique({
      where: {
        id: mysteryBoxId3,
      },
      include: {
        triggers: true,
        MysteryBoxPrize: true,
      },
    });

    expect(res).toBeDefined();
    expect(res?.id).toBe(mysteryBoxId3);
    expect(res?.status).toBe("Unopened");
    expect(res?.MysteryBoxPrize[0].status).toBe("Dismissed");

    // Check we didn't affect other boxes

    if (!mysteryBoxId2) throw new Error("MysteryBox 2 is null");

    const res2 = await prisma.mysteryBox.findUnique({
      where: {
        id: mysteryBoxId2,
      },
      include: {
        triggers: true,
        MysteryBoxPrize: true,
      },
    });

    expect(res2).toBeDefined();
    expect(res2?.id).toBe(mysteryBoxId2);
    expect(res2?.status).not.toBe("Unopened");
    expect(res2?.MysteryBoxPrize[0].status).not.toBe("Dismissed");
  });

  it("Should reveal a mystery box", async () => {
    const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

    const res = await prisma.mysteryBox.create({
      data: {
        userId: user0.id,
        triggers: {
          createMany: {
            data: {
              questionId: questionIds[3],
              triggerType: MysteryBoxEventsType.CLAIM_ALL_COMPLETED,
              mysteryBoxAllowlistId: "1",
            },
          },
        },
        MysteryBoxPrize: {
          create: {
            status: EBoxPrizeStatus.Unclaimed,
            size: "Small",
            prizeType: "Token",
            tokenAddress: bonkAddress,
            amount: "4500",
          },
        },
      },
    });

    mysteryBoxId4 = res.id;

    const box = await revealMysteryBox(mysteryBoxId4);

    expect(box).toBeDefined();
    expect(box?.mysteryBoxId).toBe(mysteryBoxId4);
    expect(box?.totalBonkWon).toBeDefined();
    expect(Object.keys(box?.tokensReceived ?? {}).length).toBe(1);
    expect(box?.tokensReceived?.[bonkAddress]).toBe(4500);
  });

  it("Should fail to open another user's mystery box", async () => {
    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user1.id });

    await expect(openMysteryBox(mysteryBoxId4!)).rejects.toThrow();

    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user0.id });
  });

  it("Should open a mystery box", async () => {
    expect(jest.isMockFunction(sendBonkFromTreasury)).toBeTruthy();

    const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

    const txHashes = await openMysteryBox(mysteryBoxId4!);

    expect(sendBonkFromTreasury).toHaveBeenCalledWith(4500, user0.wallet);

    expect(Object.keys(txHashes ?? {}).length).toBe(1);
    expect(txHashes?.[bonkAddress]).toBeDefined();

    const box = await prisma.mysteryBox.findUnique({
      where: {
        id: mysteryBoxId4!,
      },
      include: {
        MysteryBoxPrize: true,
      },
    });

    expect(box?.status).toBe(EMysteryBoxStatus.Opened);
    expect(box?.MysteryBoxPrize[0].status).toBe(EBoxPrizeStatus.Claimed);
  });

  it("Should disallow opening an opened mystery box", async () => {
    await expect(openMysteryBox(mysteryBoxId4!)).rejects.toThrow();
  });
});
