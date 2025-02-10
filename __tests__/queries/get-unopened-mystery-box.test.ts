import { getUnopenedMysteryBox } from "@/app/queries/mysteryBox";
import prisma from "@/app/services/prisma";
import { authGuard } from "@/app/utils/auth";
import { generateUsers } from "@/scripts/utils";
import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EBoxTriggerType,
  EMysteryBoxStatus,
} from "@prisma/client";

import { deleteMysteryBoxes } from "../actions/mystery-box.test";

// Mocking authGuard
jest.mock("@/app/utils/auth");

describe("getUnopenedMysteryBox", () => {
  let user1: { id: string; username: string };
  let user2: { id: string; username: string };
  let mysteryBox1: string;
  let mysteryBox2: string;
  let questionIds: number[];
  let deckId: number;
  const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

  beforeAll(async () => {
    const users = await generateUsers(2);
    user1 = users[0];
    user2 = users[1];

    await prisma.user.createMany({
      data: users,
    });

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
        deck: "Deck Sample",
        revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        stackId: null,
        deckQuestions: {
          create: Array(1).fill({ question }),
        },
      },
      include: {
        deckQuestions: true,
      },
    });

    questionIds = deck.deckQuestions.map((q) => q.questionId);
    deckId = deck.id;

    const box1 = await prisma.mysteryBox.create({
      data: {
        userId: user1.id,
        status: EMysteryBoxStatus.Unopened,
      },
    });

    await prisma.mysteryBoxTrigger.create({
      data: {
        questionId: questionIds[0],
        triggerType: EBoxTriggerType.ValidationReward,
        mysteryBoxId: box1.id,
        MysteryBoxPrize: {
          createMany: {
            data: [
              {
                status: EBoxPrizeStatus.Unclaimed,
                prizeType: EBoxPrizeType.Token,
                size: "Small",
                amount: "40",
                tokenAddress: bonkAddress,
              },
            ],
          },
        },
      },
    });

    const box2 = await prisma.mysteryBox.create({
      data: {
        userId: user2.id,
        status: EMysteryBoxStatus.Opened,
      },
    });

    mysteryBox1 = box1.id;
    mysteryBox2 = box2.id;
  });

  // Clean up after all tests
  afterAll(async () => {
    await deleteMysteryBoxes([mysteryBox1, mysteryBox2]);
    await prisma.questionOption.deleteMany({
      where: {
        questionId: {
          in: questionIds,
        },
      },
    });
    await prisma.deckQuestion.deleteMany({
      where: {
        questionId: {
          in: questionIds,
        },
      },
    });
    await prisma.question.deleteMany({
      where: {
        id: {
          in: questionIds,
        },
      },
    });
    await prisma.deck.delete({
      where: {
        id: deckId,
      },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [user1.id, user2.id] },
      },
    });
  });

  it("should return unopened mystery box for user", async () => {
    // Create test mystery box

    (authGuard as jest.Mock).mockResolvedValue({ sub: user1.id });

    const result = await getUnopenedMysteryBox([
      EBoxTriggerType.ValidationReward,
    ]);

    expect(result).toBe(mysteryBox1);
  });

  it("should return null when no unopened box exists", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ sub: user2.id });

    const result = await getUnopenedMysteryBox([
      EBoxTriggerType.ClaimAllCompleted,
    ]);

    expect(result).toBeNull();
  });
});
