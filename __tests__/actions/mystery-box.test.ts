import { deleteDeck } from "@/app/actions/deck/deck";
import { getJwtPayload } from "@/app/actions/jwt";
import { dismissMysteryBox } from "@/app/actions/mysteryBox/dismiss";
import { openMysteryBox } from "@/app/actions/mysteryBox/open";
import { revealMysteryBox } from "@/app/actions/mysteryBox/reveal";
import { getUserTotalCreditAmount } from "@/app/queries/home";
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

describe.skip("Create mystery box", () => {
  const currentDate = new Date();

  let user0: { id: string; username: string; wallet: string };
  let user1: { id: string; username: string; wallet: string };
  let questionIds: number[];
  let deckId: number;
  let mysteryBoxId: string | null;
  let mysteryBoxId2: string | null;
  let mysteryBoxId3: string | null;
  let mysteryBoxId4: string | null;
  let mysteryBoxId5: string | null;

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

    const users = await generateUsers(2);

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
    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: { userId: user0.id },
    });

    await deleteDeck(deckId);

    await deleteMysteryBoxes(
      [
        mysteryBoxId,
        mysteryBoxId2,
        mysteryBoxId3,
        mysteryBoxId4,
        mysteryBoxId5,
      ].filter((box) => box !== null && box !== undefined),
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

    await prisma.mysteryBoxAllowlist.deleteMany({
      where: {
        address: { in: [user0.wallet, user1.wallet] },
      },
    });
  });

  it("Should create a new mystery box with triggers and prizes", async () => {
    mysteryBoxId = await rewardMysteryBox(
      user0.id,
      EBoxTriggerType.RevealAllCompleted,
      [questionIds[0]],
    );
    if (mysteryBoxId) {
      const res = await prisma.mysteryBox.findUnique({
        where: {
          id: mysteryBoxId,
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
      // Assertions
      expect(res).toBeDefined();
      expect(res?.id).toBe(mysteryBoxId);
      expect(res?.status).toBe("New");
      expect(res?.triggers).toHaveLength(1);
    }
  });

  it("Should calculate the user's total token winnings", async () => {
    // Create a second box
    mysteryBoxId2 = await rewardMysteryBox(
      user0.id,
      EBoxTriggerType.RevealAllCompleted,
      [questionIds[1]],
    );

    if (!mysteryBoxId || !mysteryBoxId2)
      throw new Error("Missing mystery box id(s)");

    const prize1 = await prisma.mysteryBoxTrigger.findFirst({
      where: {
        mysteryBoxId,
        MysteryBoxPrize: {
          some: { prizeType: { equals: "Token" } },
        },
      },
    });

    const prize2 = await prisma.mysteryBoxTrigger.findFirst({
      where: {
        mysteryBoxId: mysteryBoxId2,
        MysteryBoxPrize: {
          some: { prizeType: { equals: "Token" } },
        },
      },
    });

    await prisma.mysteryBoxPrize.updateMany({
      where: {
        mysteryBoxTriggerId: {
          in: [prize1?.id, prize2?.id].filter(
            (id): id is string => id !== undefined,
          ),
        },
      },
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
      EBoxTriggerType.RevealAllCompleted,
      [questionIds[2]],
    );

    if (!mysteryBoxId3) throw new Error("Error creating mystery box");

    await dismissMysteryBox(mysteryBoxId3);

    const res = await prisma.mysteryBox.findUnique({
      where: {
        id: mysteryBoxId3,
      },
      include: {
        triggers: {
          include: {
            MysteryBoxPrize: true,
          },
        },
      },
    });

    expect(res).toBeDefined();
    expect(res?.id).toBe(mysteryBoxId3);
    expect(res?.status).toBe("Unopened");
    expect(res?.triggers[0].MysteryBoxPrize[0].status).toBe("Dismissed");

    // Check we didn't affect other boxes

    if (!mysteryBoxId2) throw new Error("MysteryBox 2 is null");

    const res2 = await prisma.mysteryBox.findUnique({
      where: {
        id: mysteryBoxId2,
      },
      include: {
        triggers: {
          select: {
            id: true,
          },
          include: {
            MysteryBoxPrize: true,
          },
        },
      },
    });

    expect(res2).toBeDefined();
    expect(res2?.id).toBe(mysteryBoxId2);
    expect(res2?.status).not.toBe("Unopened");
    expect(res?.triggers[0].MysteryBoxPrize[0].status).not.toBe("Dismissed");
  });

  it("Should reveal a mystery box", async () => {
    const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

    const res = await prisma.mysteryBox.create({
      data: {
        userId: user0.id,
      },
    });

    await prisma.mysteryBoxTrigger.create({
      data: {
        questionId: questionIds[3],
        triggerType: MysteryBoxEventsType.CLAIM_ALL_COMPLETED,
        mysteryBoxId: res.id,
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

    const box = await revealMysteryBox(mysteryBoxId4, false);

    expect(box).toBeDefined();
    expect(box?.mysteryBoxId).toBe(mysteryBoxId4);
    expect(box?.totalBonkWon).toBeDefined();
    expect(Object.keys(box?.tokensReceived ?? {}).length).toBe(1);
    expect(box?.tokensReceived?.[bonkAddress]).toBe(4500);
  });

  it("Should fail to open another user's mystery box", async () => {
    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user1.id });

    await expect(openMysteryBox(mysteryBoxId4!, false)).rejects.toThrow();

    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user0.id });
  });

  it("Should open a mystery box", async () => {
    expect(jest.isMockFunction(sendBonkFromTreasury)).toBeTruthy();

    const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

    const txHashes = await openMysteryBox(mysteryBoxId4!, false);

    expect(sendBonkFromTreasury).toHaveBeenCalledWith(4500, user0.wallet);

    expect(Object.keys(txHashes ?? {}).length).toBe(1);
    expect(txHashes?.[bonkAddress]).toBeDefined();

    const box = await prisma.mysteryBox.findUnique({
      where: {
        id: mysteryBoxId4!,
      },
      include: {
        triggers: {
          include: {
            MysteryBoxPrize: true,
          },
        },
      },
    });

    expect(box?.status).toBe(EMysteryBoxStatus.Opened);

    expect(box?.triggers[0].MysteryBoxPrize[0].status).toBe(
      EBoxPrizeStatus.Claimed,
    );

    const chainTx = await prisma.chainTx.findUnique({
      where: {
        hash: txHashes?.[bonkAddress],
      },
    });

    expect(chainTx).toBeDefined();
    expect(chainTx?.solAmount).toBe("0");
    expect(chainTx?.tokenAmount).toBe("4500");
    expect(chainTx?.tokenAddress).toBe(bonkAddress);
    expect(chainTx?.recipientAddress).toBe(user0.wallet);
  });

  it("Should disallow opening an opened mystery box", async () => {
    await expect(openMysteryBox(mysteryBoxId4!, false)).rejects.toThrow();
  });

  it("Should open a credits mystery box and distribute the credits", async () => {
    const res = await prisma.mysteryBox.create({
      data: {
        userId: user0.id,
      },
    });

    await prisma.mysteryBoxTrigger.create({
      data: {
        questionId: questionIds[4],
        triggerType: MysteryBoxEventsType.CLAIM_ALL_COMPLETED,
        mysteryBoxId: res.id,
        MysteryBoxPrize: {
          create: {
            status: EBoxPrizeStatus.Unclaimed,
            size: "Small",
            prizeType: "Credits",
            amount: "560",
          },
        },
      },
    });

    mysteryBoxId5 = res.id;

    const txHashes = await openMysteryBox(mysteryBoxId5!, false);

    expect(Object.keys(txHashes ?? {}).length).toBe(0);

    const box = await prisma.mysteryBox.findUnique({
      where: {
        id: mysteryBoxId5!,
      },
      include: {
        triggers: {
          include: {
            MysteryBoxPrize: true,
          },
        },
      },
    });

    expect(box?.status).toBe(EMysteryBoxStatus.Opened);
    expect(box?.triggers[0].MysteryBoxPrize[0].status).toBe(
      EBoxPrizeStatus.Claimed,
    );

    const credits = await getUserTotalCreditAmount();

    expect(credits).toEqual(560);
  });
});
