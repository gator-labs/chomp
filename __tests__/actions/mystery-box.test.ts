// import { rewardMysteryBox } from "@/app/actions/box";
import { deleteDeck } from "@/app/actions/deck/deck";
import { getJwtPayload } from "@/app/actions/jwt";
import {
  calculateTotalPrizeTokens,
  dismissMysteryBox,
  rewardMysteryBox,
} from "@/app/actions/mysteryBox";
import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";
import { EBoxPrizeStatus, EBoxTriggerType } from "@prisma/client";

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

async function deleteMysteryBox(mysteryBoxId: string) {
  const mysteryBoxRes = await prisma.mysteryBox.findUnique({
    where: {
      id: mysteryBoxId,
    },
    include: {
      triggers: true,
      MysteryBoxPrize: true,
    },
  });
  await prisma.mysteryBoxPrize.delete({
    where: {
      id: mysteryBoxRes?.MysteryBoxPrize[0].id,
    },
  });
  await prisma.mysteryBoxTrigger.delete({
    where: {
      id: mysteryBoxRes?.triggers[0].id,
    },
  });
  await prisma.mysteryBox.delete({
    where: {
      id: mysteryBoxId,
    },
  });
}

describe("Create mystery box", () => {
  const currentDate = new Date();

  let user: { id: string; username: string }[];
  let questionId: number;
  let deckId: number;
  let mysteryBoxId: string | null;
  let mysteryBoxId2: string | null;
  let mysteryBoxId3: string | null;

  beforeAll(async () => {
    const deck = await prisma.deck.create({
      data: {
        deck: `deck ${currentDate}`,
        revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        stackId: null,
        deckQuestions: {
          create: {
            question: {
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
            },
          },
        },
      },
      include: {
        deckQuestions: true,
      },
    });

    questionId = deck.deckQuestions[0].id;
    deckId = deck.id;
    user = await generateUsers(1);
    await prisma.user.createMany({
      data: user,
    });
  });

  afterAll(async () => {
    await deleteDeck(deckId);

    if (mysteryBoxId) {
      await deleteMysteryBox(mysteryBoxId);
    }

    if (mysteryBoxId2) {
      await deleteMysteryBox(mysteryBoxId2);
    }

    if (mysteryBoxId3) {
      await deleteMysteryBox(mysteryBoxId3);
    }

    await prisma.user.delete({
      where: {
        id: user[0].id,
      },
    });
  });

  it("Should create a new mystery box with triggers and prizes", async () => {
    const mockPayload = { sub: user[0].id };
    (getJwtPayload as jest.Mock).mockResolvedValue(mockPayload);
    mysteryBoxId = await rewardMysteryBox({
      triggerType: EBoxTriggerType.ClaimAllCompleted,
      questionIds: [questionId],
    });
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
    const mockPayload = { sub: user[0].id };
    (getJwtPayload as jest.Mock).mockResolvedValue(mockPayload);
    mysteryBoxId2 = await rewardMysteryBox({
      triggerType: EBoxTriggerType.ClaimAllCompleted,
      questionIds: [questionId],
    });

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
      user[0].id,
      process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "",
    );

    expect(Number(totalWon)).toEqual(4600);
  });

  it("Should dismiss a mystery box", async () => {
    // Create a second box
    const mockPayload = { sub: user[0].id };
    (getJwtPayload as jest.Mock).mockResolvedValue(mockPayload);
    mysteryBoxId3 = await rewardMysteryBox({
      triggerType: EBoxTriggerType.ClaimAllCompleted,
      questionIds: [questionId],
    });

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
});
