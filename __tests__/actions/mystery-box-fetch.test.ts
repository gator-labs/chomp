import { deleteDeck } from "@/app/actions/deck/deck";
import { getJwtPayload } from "@/app/actions/jwt";
import { getRevealAllMysteryBoxForQuestions } from "@/app/actions/mysteryBox/getRevealAllForQuestions";
import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";
import { EBoxTriggerType, EMysteryBoxStatus } from "@prisma/client";

import { deleteMysteryBoxes } from "./mystery-box.test";

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

  let user: { id: string; username: string };
  let questionIds: number[];
  let deckId: number;
  let mysteryBoxId: string | null;

  beforeAll(async () => {
    const question = {
      create: {
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
          create: Array(3).fill({ question }),
        },
      },
      include: {
        deckQuestions: true,
      },
    });

    questionIds = deck.deckQuestions.map((q) => q.questionId);

    deckId = deck.id;

    const users = await generateUsers(1);

    user = {
      id: users[0].id,
      username: users[0].username,
    };

    await prisma.user.createMany({
      data: users,
    });

    const mysteryBox = await prisma.mysteryBox.create({
      data: {
        userId: user.id,
        status: EMysteryBoxStatus.New,
        triggers: {
          create: questionIds.map((questionId) => ({
            triggerType: EBoxTriggerType.RevealAllCompleted,
            questionId: questionId,
          })),
        },
      },
    });

    mysteryBoxId = mysteryBox.id;

    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user.id });
  });

  afterAll(async () => {
    await deleteDeck(deckId);

    await deleteMysteryBoxes(
      [mysteryBoxId].filter((box) => box !== null && box !== undefined),
    );

    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
  });

  it("Should fetch new mystery box with trigger reveal all completed", async () => {
    const res = await getRevealAllMysteryBoxForQuestions(questionIds);

    // Assertions
    expect(res).toBeDefined();
    expect(res).toBe(mysteryBoxId);
  });

  it("Should not return new mystery box with fake question ids", async () => {
    const res = await getRevealAllMysteryBoxForQuestions([1, 2, 3]);

    // Assertions
    expect(res).toBeNull();
  });
});
