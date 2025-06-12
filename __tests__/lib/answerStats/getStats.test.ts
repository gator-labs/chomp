import prisma, { PrismaTransactionClient } from "@/app/services/prisma";
import { getAnswerStats } from "@/lib/answerStats/getStats";
import { generateUsers } from "@/scripts/utils";
import { faker } from "@faker-js/faker";
import {
  EBoxPrizeStatus,
  EMysteryBoxStatus,
  PrismaClient,
  QuestionType,
  ResultType,
  Token,
  TransactionStatus,
} from "@prisma/client";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

async function createMysteryBox(
  userId: string,
  questionId: number,
  tx: PrismaClient | PrismaTransactionClient,
) {
  const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

  const res = await tx.mysteryBox.create({
    data: {
      userId,
      status: EMysteryBoxStatus.Opened,
    },
  });

  await tx.mysteryBoxTrigger.create({
    data: {
      questionId: questionId,
      triggerType: "ValidationReward",
      mysteryBoxId: res.id,
      MysteryBoxPrize: {
        createMany: {
          data: [
            {
              status: EBoxPrizeStatus.Claimed,
              claimedAt: new Date(),
              size: "Small",
              prizeType: "Token",
              tokenAddress: bonkAddress,
              amount: "4500",
            },
            {
              status: EBoxPrizeStatus.Claimed,
              claimedAt: new Date(),
              size: "Small",
              prizeType: "Credits",
              amount: "5",
            },
          ],
        },
      },
    },
  });

  return res;
}

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

describe("getAnswerStats", () => {
  let mysteryBoxId: string;
  const otherMysteryBoxIds: string[] = [];

  const user1 = {
    id: uuidv4(),
    username: `user1`,
  };

  let deckId: number;
  let legacyDeckId: number;
  let questionIds: number[] = [];
  let otherUsers: { id: string; username: string }[] = [];

  beforeAll(async () => {
    const futureDate = dayjs().add(1, "day").toDate();
    const pastDate = dayjs().subtract(1, "day").toDate();

    await prisma.$transaction(async (tx) => {
      // Create deck
      const deck = await tx.deck.create({
        data: {
          deck: "Deck 1",
          date: new Date(),
          revealAtDate: futureDate,
          creditCostPerQuestion: 2,
        },
      });

      deckId = deck.id;

      // Create users
      await Promise.all([tx.user.create({ data: user1 })]);

      // Create questions for decks
      const questions = await Promise.all([
        tx.question.create({
          data: {
            question: "Is the sky blue?",
            type: QuestionType.BinaryQuestion,
            revealAtDate: futureDate,
            revealToken: Token.Bonk,
            revealTokenAmount: 5000,
            creditCostPerQuestion: 2,
            questionOptions: {
              createMany: {
                data: [
                  {
                    option: "Yes",
                    isLeft: true,
                    calculatedIsCorrect: true,
                    calculatedPercentageOfSelectedAnswers: 90,
                    calculatedAveragePercentage: 70,
                    index: 0,
                  },
                  {
                    option: "No",
                    isLeft: false,
                    calculatedIsCorrect: false,
                    calculatedPercentageOfSelectedAnswers: 10,
                    calculatedAveragePercentage: 30,
                    index: 1,
                  },
                ],
              },
            },
          },
          include: {
            questionOptions: true,
          },
        }),
        tx.question.create({
          data: {
            question: "Is water wet?",
            type: QuestionType.BinaryQuestion,
            revealAtDate: pastDate,
            revealToken: Token.Bonk,
            revealTokenAmount: 5000,
            creditCostPerQuestion: 2,
            questionOptions: {
              createMany: {
                data: [
                  {
                    option: "Yes",
                    isLeft: true,
                    calculatedIsCorrect: true,
                    calculatedPercentageOfSelectedAnswers: 85,
                    calculatedAveragePercentage: 60,
                    index: 0,
                  },
                  {
                    option: "No",
                    isLeft: false,
                    calculatedIsCorrect: false,
                    calculatedPercentageOfSelectedAnswers: 15,
                    calculatedAveragePercentage: 40,
                    index: 1,
                  },
                ],
              },
            },
          },
          include: {
            questionOptions: true,
          },
        }),
        tx.question.create({
          data: {
            question: "Is water wet?",
            type: QuestionType.BinaryQuestion,
            revealAtDate: pastDate,
            revealToken: Token.Bonk,
            revealTokenAmount: 5000,
            creditCostPerQuestion: null,
            chompResults: {
              createMany: {
                data: [
                  {
                    userId: user1.id,
                    result: ResultType.Revealed,
                    rewardTokenAmount: 4000,
                    transactionStatus: TransactionStatus.Completed,
                    burnTransactionSignature: faker.string.hexadecimal({
                      length: 86,
                      prefix: "",
                    }),
                  },
                ],
              },
            },
            questionOptions: {
              createMany: {
                data: [
                  {
                    option: "Yes",
                    isLeft: true,
                    calculatedIsCorrect: true,
                    calculatedPercentageOfSelectedAnswers: 85,
                    calculatedAveragePercentage: 60,
                    index: 0,
                  },
                  {
                    option: "No",
                    isLeft: false,
                    calculatedIsCorrect: false,
                    calculatedPercentageOfSelectedAnswers: 15,
                    calculatedAveragePercentage: 40,
                    index: 1,
                  },
                ],
              },
            },
          },
          include: {
            questionOptions: true,
          },
        }),
      ]);

      const legacyDeck = await tx.deck.create({
        data: {
          deck: "Legacy Deck 1",
          date: new Date(),
          revealAtDate: pastDate,
          creditCostPerQuestion: null,
        },
      });

      legacyDeckId = legacyDeck.id;

      questionIds = questions.map((q) => q.id);

      await tx.deckQuestion.createMany({
        data: [
          { deckId: deckId, questionId: questions[0].id },
          { deckId: deckId, questionId: questions[1].id },
          { deckId: legacyDeckId, questionId: questions[2].id },
        ],
      });

      // Create answers for user1
      await tx.questionAnswer.createMany({
        data: questions.flatMap((question) =>
          question.questionOptions.map((qo, i) => ({
            questionOptionId: qo.id,
            userId: user1.id,
            selected: i === 0,
            percentage: i === 1 ? 50 : null,
          })),
        ),
      });

      const minAnswersPerQuestion = Number(
        process.env.MINIMAL_ANSWERS_PER_QUESTION ?? 0,
      );

      const extraUserCount = Math.max(minAnswersPerQuestion, 20);

      if (extraUserCount > 0) {
        otherUsers = await generateUsers(extraUserCount);

        await tx.user.createMany({
          data: otherUsers,
        });

        for (let userIdx = 0; userIdx < extraUserCount; userIdx++) {
          await tx.questionAnswer.createMany({
            data: questions.flatMap((question) =>
              question.questionOptions.map((qo, i) => ({
                questionOptionId: qo.id,
                userId: otherUsers[userIdx].id,
                selected: i === 0,
              })),
            ),
          });

          // Create boxes to test rewards regression
          const box = await createMysteryBox(
            otherUsers[userIdx].id,
            questionIds[1],
            tx,
          );
          otherMysteryBoxIds.push(box.id);
        }
      }
    }, { timeout: 30_000 });
  });

  afterAll(async () => {
    await deleteMysteryBoxes([mysteryBoxId]);
    await deleteMysteryBoxes(otherMysteryBoxIds);

    // Clean up the data after the test
    await prisma.$transaction(async (tx) => {
      await tx.chompResult.deleteMany({
        where: { userId: { equals: user1.id } },
      });
      await tx.questionAnswer.deleteMany({
        where: { userId: { equals: user1.id } },
      });
      await tx.questionAnswer.deleteMany({
        where: { userId: { in: otherUsers.map((user) => user.id) } },
      });
      await tx.questionOption.deleteMany({
        where: { questionId: { in: questionIds } },
      });
      await tx.deckQuestion.deleteMany({
        where: {
          questionId: {
            in: questionIds,
          },
        },
      });
      await tx.question.deleteMany({ where: { id: { in: questionIds } } });
      await tx.deck.deleteMany({ where: { id: { equals: deckId } } });
      await tx.deck.deleteMany({ where: { id: { equals: legacyDeckId } } });
      await tx.user.deleteMany({ where: { id: { equals: user1.id } } });

      if (otherUsers.length > 0) {
        await tx.user.deleteMany({
          where: { id: { in: otherUsers.map((user) => user.id) } },
        });
      }
    });
  });

  it("should not get any answer stats for unrevealed question", async () => {
    const stats = await getAnswerStats(user1.id, questionIds[0]);
    expect(stats).toBeDefined();
    expect(stats?.isQuestionRevealable).toBeFalsy();
    expect(stats?.isCalculated).toBeFalsy();
    expect(stats?.questionOptions.length).toBe(0);
  });

  it("should get answer stats for revealed and calculated question", async () => {
    const stats = await getAnswerStats(user1.id, questionIds[1]);
    expect(stats).toBeDefined();
    expect(stats?.rewardStatus).toBe("claimable");
    expect(stats?.isFirstOrderCorrect).toBe(true);
    expect(stats?.isSecondOrderCorrect).toBe(null); // Don't know this without a mystery box
    expect(stats?.isPracticeQuestion).toBe(false);
    expect(stats?.isLegacyQuestion).toBe(false);
    expect(stats?.QuestionRewards.length).toBe(0);
  });

  it("should get answer stats for revealed, calculated and rewarded question", async () => {
    // Default timeout is 5s. Because the beforeAll hook writes so much to the database,
    // this first test sometimes takes just a bit longer thant 5s. This syntax allows us to 
    // increase the timeout for this test only.
    const mysteryBox = await prisma.$transaction(async (tx) => {
      return await createMysteryBox(user1.id, questionIds[1], tx);
    }, { timeout: 10_000 });
    mysteryBoxId = mysteryBox.id;

    const stats = await getAnswerStats(user1.id, questionIds[1]);
    expect(stats).toBeDefined();
    expect(stats?.rewardStatus).toBe("claimed");
    expect(stats?.isFirstOrderCorrect).toBe(true);
    expect(stats?.isSecondOrderCorrect).toBe(true);
    expect(stats?.isPracticeQuestion).toBe(false);
    expect(stats?.isLegacyQuestion).toBe(false);
    expect(stats?.QuestionRewards.length).toBeGreaterThan(0);
    expect(stats?.QuestionRewards?.[0].bonkReward).toBe("4500");
    expect(stats?.QuestionRewards?.[0].creditsReward).toBe("5");
  });

  it("should get answer stats for revealed but incomplete equestion", async () => {
    await prisma.questionAnswer.updateMany({
      data: {
        percentage: null,
      },
      where: {
        userId: user1.id,
        questionOption: {
          questionId: questionIds[1],
        },
      },
    });

    const stats = await getAnswerStats(user1.id, questionIds[1]);
    expect(stats).toBeDefined();
    expect(stats?.rewardStatus).toBe("no-reward");
  });

  it("should return correct practice deck status", async () => {
    await prisma.question.update({
      data: {
        creditCostPerQuestion: 0,
      },
      where: {
        id: questionIds[1],
      },
    });

    const stats = await getAnswerStats(user1.id, questionIds[1]);
    expect(stats).toBeDefined();
    expect(stats?.isPracticeQuestion).toBe(true);
  });

  it("should get answer stats for a legacy question", async () => {
    const stats = await getAnswerStats(user1.id, questionIds[2]);
    expect(stats).toBeDefined();
    expect(stats?.rewardStatus).toBe("claimed");
    expect(stats?.isFirstOrderCorrect).toBe(true);
    expect(stats?.isSecondOrderCorrect).toBe(false);
    expect(stats?.isPracticeQuestion).toBe(false);
    expect(stats?.isLegacyQuestion).toBe(true);
    expect(stats?.QuestionRewards.length).toBeGreaterThan(0);
    expect(stats?.QuestionRewards?.[0].bonkReward).toBe("4000");
    expect(stats?.QuestionRewards?.[0].creditsReward).toBe("0");
  });

  it("should get answer stats for a legacy question without chomp result", async () => {
    await prisma.chompResult.deleteMany({
      where: { questionId: { equals: questionIds[2] } },
    });

    const stats = await getAnswerStats(user1.id, questionIds[2]);
    expect(stats).toBeDefined();
    expect(stats?.rewardStatus).toBe("no-reward");
    expect(stats?.isFirstOrderCorrect).toBe(true);
    expect(stats?.isSecondOrderCorrect).toBe(false);
    expect(stats?.isPracticeQuestion).toBe(false);
    expect(stats?.isLegacyQuestion).toBe(true);
    expect(stats?.QuestionRewards.length).toBe(0);
  });

  it("should get correct answered status", async () => {
    const stats = await getAnswerStats(user1.id, questionIds[1]);
    expect(stats).toBeDefined();
    expect(stats?.isQuestionAnsweredByUser).toBeTruthy();

    await prisma.questionAnswer.updateMany({
      data: {
        selected: false,
      },
      where: {
        userId: user1.id,
        questionOption: {
          questionId: questionIds[1],
        },
      },
    });

    const stats2 = await getAnswerStats(user1.id, questionIds[1]);
    expect(stats2).toBeDefined();
    expect(stats2?.isQuestionAnsweredByUser).toBeFalsy();
  });
});
