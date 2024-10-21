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
    });
    deckId = deck.id;
    users = await generateUsers(50);

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

    for (const user of users) {
      const selectedOption = questionOptions[Math.floor(Math.random() * 4)];
      const secondOrderOption = questionOptions[secondOrderOptionIndex];

      for (const option of questionOptions) {
        const isSelectedOption = option.id === selectedOption.id;
        const percentage =
          secondOrderOption.id === option.id
            ? Math.floor(Math.random() * 100)
            : null;

        await prisma.questionAnswer.create({
          data: {
            userId: user.id,
            questionOptionId: option.id,
            percentage: percentage,
            selected: isSelectedOption,
            timeToAnswer: BigInt(Math.floor(Math.random() * 60000)),
          },
        });

        await prisma.fungibleAssetTransactionLog.create({
          data: {
            userId: user.id,
            questionId: option.questionId,
            asset: FungibleAsset.Point,
            change: Math.floor(Math.random() * 100),
            type: TransactionLogType.AnswerQuestion,
          },
        });
      }
      secondOrderOptionIndex =
        secondOrderOptionIndex === 3 ? 0 : secondOrderOptionIndex + 1;
    }

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
  });

  // afterAll(async () => {
  //   await prisma.fungibleAssetTransactionLog.deleteMany({
  //     where: {
  //       question: {
  //         deckQuestions: {
  //           some: {
  //             deckId: deckId,
  //           },
  //         },
  //       },
  //     },
  //   });
  //   await deleteDeck(deckId);

  //   await prisma.user.deleteMany({
  //     where: {
  //       id: {
  //         in: users.map((user) => user.id),
  //       },
  //     },
  //   });
  // });

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
