import { deleteDeck } from "@/app/actions/deck/deck";
import { getJwtPayload } from "@/app/actions/jwt";
import { openMysteryBox } from "@/app/actions/mysteryBox/open";
import { revealMysteryBox } from "@/app/actions/mysteryBox/reveal";
import { getUserTotalCreditAmount } from "@/app/queries/home";
import prisma from "@/app/services/prisma";
import { sendBonkFromTreasury } from "@/lib/mysteryBox";
import { generateUsers } from "@/scripts/utils";
import { MysteryBoxEventsType } from "@/types/mysteryBox";
import { faker } from "@faker-js/faker";
import {
  EBoxPrizeStatus,
  EChainTxType,
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

describe("Create mystery box", () => {
  const currentDate = new Date();

  let user0: { id: string; username: string; wallet: string };
  let user1: { id: string; username: string; wallet: string };
  let questionIds: number[];
  let deckId: number;
  let mysteryBoxId4: string | null;
  let mysteryBoxId5: string | null;
  let txHashes: string[];

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
              index: 0,
            },
            {
              option: "B",
              isCorrect: false,
              isLeft: false,
              index: 1,
            },
            {
              option: "C",
              isCorrect: false,
              isLeft: false,
              index: 2,
            },
            {
              option: "D",
              isCorrect: false,
              isLeft: false,
              index: 3,
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
    await prisma.userBalance.deleteMany({
      where: { userId: user0.id },
    });

    await deleteDeck(deckId);

    await deleteMysteryBoxes(
      [mysteryBoxId4, mysteryBoxId5].filter(
        (box) => box !== null && box !== undefined,
      ),
    );

    // Delete all ChainTx records that belong to these wallets
    await prisma.chainTx.deleteMany({
      where: {
        hash: {
          in: txHashes,
        },
      },
    });

    // Delete the actuall wallets
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

    const txHashesObj = await openMysteryBox(mysteryBoxId4!, false);

    txHashes = Object.values(txHashesObj || {});

    expect(sendBonkFromTreasury).toHaveBeenCalledWith(
      4500,
      user0.wallet,
      EChainTxType.MysteryBoxClaim,
    );

    expect(Object.keys(txHashesObj ?? {}).length).toBe(1);
    expect(txHashesObj?.[bonkAddress]).toBeDefined();

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
        hash: txHashesObj?.[bonkAddress],
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
