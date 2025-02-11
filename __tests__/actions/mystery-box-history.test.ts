import { getJwtPayload } from "@/app/actions/jwt";
import { fetchMysteryBoxHistory } from "@/app/actions/mysteryBox/fetchHistory";
import { MYSTERY_BOXES_PER_PAGE } from "@/app/constants/mysteryBox";
import prisma from "@/app/services/prisma";
import { authGuard } from "@/app/utils/auth";
import { generateUsers } from "@/scripts/utils";
import { faker } from "@faker-js/faker";
import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EBoxTriggerType,
  EMysteryBoxStatus,
  EPrizeSize,
} from "@prisma/client";

jest.mock("@/app/utils/auth");

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

export async function deleteMysteryBoxesByUser(userId: string) {
  const boxes = await prisma.mysteryBox.findMany({
    where: {
      userId,
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
      userId,
    },
  });
}

describe("Mystery box history", () => {
  let user0: { id: string; username: string; wallet: string };
  let user1: { id: string; username: string; wallet: string };
  let user2: { id: string; username: string; wallet: string };
  let questionIds: number[];
  let deckId: number;

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
          create: Array(MYSTERY_BOXES_PER_PAGE + 4).fill({ question }),
        },
      },
      include: {
        deckQuestions: true,
      },
    });

    questionIds = deck.deckQuestions.map((q) => q.questionId);
    deckId = deck.id;

    // Create one and a bit pages of mystery boxes

    const boxes: { userId: string; status: EMysteryBoxStatus }[] =
      questionIds.map(() => ({
        userId: user0.id,
        status: EMysteryBoxStatus.Opened,
      }));

    // Make one owned by another user
    boxes[boxes.length - 1].userId = user1.id;

    // Make another one unopened
    boxes[boxes.length - 2].status = EMysteryBoxStatus.New;

    const createdBoxes = await prisma.mysteryBox.createManyAndReturn({
      data: boxes,
    });

    async function createMysteryBoxTriggers() {
      await Promise.all(
        questionIds.map((qId, i) =>
          prisma.mysteryBoxTrigger.create({
            data: {
              triggerType: EBoxTriggerType.ValidationReward,
              mysteryBoxId: createdBoxes[i].id,
              questionId: qId,
              MysteryBoxPrize: {
                create: {
                  status: EBoxPrizeStatus.Claimed,
                  size: EPrizeSize.Small,
                  prizeType: EBoxPrizeType.Credits,
                  tokenAddress: null,
                  amount: "1000",
                  claimedAt: new Date(),
                },
              },
            },
          }),
        ),
      );
    }

    await createMysteryBoxTriggers();

    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user0.id });
    (authGuard as jest.Mock).mockResolvedValue({ sub: user0.id });
  });

  afterAll(async () => {
    await deleteMysteryBoxesByUser(user0.id);
    await deleteMysteryBoxesByUser(user1.id);

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
        id: { in: [user0.id, user1.id] },
      },
    });
  });

  it("Should verify the mystery box history paging", async () => {
    const boxesPage1 = await fetchMysteryBoxHistory({ currentPage: 1 });

    expect(boxesPage1?.data.length).toEqual(MYSTERY_BOXES_PER_PAGE);
    expect(boxesPage1?.hasMore).toBeTruthy();

    const boxesPage2 = await fetchMysteryBoxHistory({ currentPage: 2 });

    expect(boxesPage2?.data.length).toEqual(2);
    expect(boxesPage2?.hasMore).toBeFalsy();
  });

  it("Should return empty history for a user with no mystery boxes", async () => {
    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user2.id });
    (authGuard as jest.Mock).mockResolvedValue({ sub: user2.id });

    const boxes = await fetchMysteryBoxHistory({ currentPage: 1 });

    expect(boxes?.data.length).toEqual(0);
    expect(boxes?.hasMore).toBeFalsy();
  });

  it("Should handle large page numbers gracefully", async () => {
    const boxes = await fetchMysteryBoxHistory({ currentPage: 100 });

    expect(boxes?.data.length).toEqual(0);
    expect(boxes?.hasMore).toBeFalsy();
  });
});
