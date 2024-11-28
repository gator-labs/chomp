// import { rewardMysteryBox } from "@/app/actions/box";
import { deleteDeck } from "@/app/actions/deck/deck";
import { getJwtPayload } from "@/app/actions/jwt";
import { rewardMysteryBox } from "@/app/actions/mysteryBox";
import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";
import { EBoxTriggerType } from "@prisma/client";

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

describe("Create mystery box", () => {
  const currentDate = new Date();

  let user: { id: string; username: string }[];
  let questionId: number;
  let deckId: number;
  let mysteryBoxId: string | null;
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
    await prisma.user.delete({
      where: {
        id: user[0].id,
      },
    });
    mysteryBoxId = null;
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
});
