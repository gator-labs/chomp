import { deleteDeck } from "@/app/actions/deck/deck";
import { getLeaderboard } from "@/app/actions/leaderboard";
import { getDeckSchema } from "@/app/queries/deck";
import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";
import {
  FungibleAsset,
  ResultType,
  TransactionLogType,
  TransactionStatus,
} from "@prisma/client";

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Get All-time leaderboard data", () => {
  const currentDate = new Date();
  let deckId: number;
  let users: { id: string; username: string }[] = [];

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
            },
          },
        },
      },
    });
    deckId = deck.id;
    users = await generateUsers(10);

    await prisma.user.createMany({
      data: users,
    });

    const questionOptions = await prisma.questionOption.findMany({
      where: {
        question: {
          deckQuestions: {
            some: {
              deckId: deck.id,
            },
          },
        },
      },
    });

    let secondOrderOptionIndex = 0;

    const qaData = [];
    const fatlData = [];

    for (const user of users) {
      const selectedOption = questionOptions[Math.floor(Math.random() * 4)];
      const secondOrderOption = questionOptions[secondOrderOptionIndex];

      for (const option of questionOptions) {
        const isSelectedOption = option.id === selectedOption.id;
        const percentage =
          secondOrderOption.id === option.id
            ? Math.floor(Math.random() * 100)
            : null;

        qaData.push({
          userId: user.id,
          questionOptionId: option.id,
          percentage: percentage,
          selected: isSelectedOption,
          timeToAnswer: BigInt(Math.floor(Math.random() * 60000)),
        });
      }

      fatlData.push({
        userId: user.id,
        questionId: questionOptions[0].questionId,
        asset: FungibleAsset.Point,
        change: Math.floor(Math.random() * 100),
        type: TransactionLogType.AnswerQuestion,
      });

      secondOrderOptionIndex =
        secondOrderOptionIndex === 3 ? 0 : secondOrderOptionIndex + 1;
    }

    await prisma.questionAnswer.createMany({ data: qaData });
    await prisma.fungibleAssetTransactionLog.createMany({ data: fatlData });

    const getDeck = await getDeckSchema(deckId);

    await prisma.chompResult.createMany({
      data: [
        {
          questionId: getDeck?.questions[0].id,
          userId: users[0].id,
          result: ResultType.Claimed,
          burnTransactionSignature:
            "5f2jHgZ9mN2KqPLdFg7sRfTqkg5p6aGbWz8zTgUPZTxZq5MyVQLCzT5QfALdPrB6J7Fkfg8Vhf5U5PqZ8xg8zMNZ",
          rewardTokenAmount: 1000,
          transactionStatus: TransactionStatus.Completed,
        },
      ],
    });
  }, 30_000);

  afterAll(async () => {
    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: {
        question: {
          deckQuestions: {
            some: {
              deckId: deckId,
            },
          },
        },
      },
    });
    await deleteDeck(deckId);

    await prisma.user.deleteMany({
      where: {
        id: {
          in: users.map((user) => user.id),
        },
      },
    });
  }, 30_000);

  it("should return data for totalPoints filter", async () => {
    const res = await getLeaderboard({
      filter: "totalPoints",
      variant: "all-time",
    });

    // Assert that ranking is an array and has the expected number of entries
    expect(Array.isArray(res?.ranking)).toBe(true);
    expect(res?.ranking.length).toBeGreaterThan(0);
  });

  it("should return data for totalBonkClaimed filter", async () => {
    const res = await getLeaderboard({
      filter: "totalBonkClaimed",
      variant: "all-time",
    });

    // Assert that ranking is defined and is an array
    expect(Array.isArray(res?.ranking)).toBe(true);
    expect(res?.ranking?.length).toBeGreaterThan(0);
  });

  it("should return data for chompedQuestions filter", async () => {
    const res = await getLeaderboard({
      filter: "chompedQuestions",
      variant: "all-time",
    });

    // Assert that ranking is an array and has the expected number of entries
    expect(Array.isArray(res?.ranking)).toBe(true);
    expect(res?.ranking.length).toBeGreaterThan(0);
  });
});
