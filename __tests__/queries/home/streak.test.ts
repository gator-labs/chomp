import { getUsersLatestStreak } from "@/app/queries/home";
import prisma from "@/app/services/prisma";
import { authGuard } from "@/app/utils/auth";
import {
  AnswerStatus,
  QuestionType,
  ResultType,
  Token,
  TransactionStatus,
} from "@prisma/client";
import { subDays } from "date-fns";
import { v4 as uuidv4 } from "uuid";

jest.mock("@/app/utils/auth");
jest.mock("p-retry", () => ({
  retry: jest.fn((fn) => fn()),
}));

describe("getUsersLatestStreak", () => {
  const user1 = {
    id: uuidv4(),
    username: `user1`,
  };

  const user2 = {
    id: uuidv4(),
    username: `user2`,
  };

  const user3 = {
    id: uuidv4(),
    username: `user3`,
  };

  let questionsIds: number[] = [];

  beforeAll(async () => {
    await prisma.$transaction(async (tx) => {
      const questions = await Promise.all([
        tx.question.create({
          data: {
            question: "Is the sky blue?",
            type: QuestionType.BinaryQuestion,
            revealAtDate: new Date("2024-10-11 16:00:00.000"),
            revealToken: Token.Bonk,
            revealTokenAmount: 5000,
            questionOptions: {
              createMany: {
                data: [
                  {
                    option: "Yes",
                    isLeft: true,
                    calculatedIsCorrect: true,
                    calculatedPercentageOfSelectedAnswers: 90,
                    calculatedAveragePercentage: 70,
                  },
                  {
                    option: "No",
                    isLeft: false,
                    calculatedIsCorrect: false,
                    calculatedPercentageOfSelectedAnswers: 10,
                    calculatedAveragePercentage: 30,
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
            revealAtDate: new Date("2024-10-12 16:00:00.000"),
            revealToken: Token.Bonk,
            revealTokenAmount: 5000,
            questionOptions: {
              createMany: {
                data: [
                  {
                    option: "Yes",
                    isLeft: true,
                    calculatedIsCorrect: true,
                    calculatedPercentageOfSelectedAnswers: 85,
                    calculatedAveragePercentage: 60,
                  },
                  {
                    option: "No",
                    isLeft: false,
                    calculatedIsCorrect: false,
                    calculatedPercentageOfSelectedAnswers: 15,
                    calculatedAveragePercentage: 40,
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
            question: "Is the earth flat?",
            type: QuestionType.BinaryQuestion,
            revealAtDate: new Date("2024-10-13 16:00:00.000"),
            revealToken: Token.Bonk,
            revealTokenAmount: 5000,
            questionOptions: {
              createMany: {
                data: [
                  {
                    option: "Yes",
                    isLeft: true,
                    calculatedIsCorrect: false,
                    calculatedPercentageOfSelectedAnswers: 20,
                    calculatedAveragePercentage: 50,
                  },
                  {
                    option: "No",
                    isLeft: false,
                    calculatedIsCorrect: true,
                    calculatedPercentageOfSelectedAnswers: 80,
                    calculatedAveragePercentage: 70,
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

      questionsIds = questions.map((q) => q.id);

      // Create users
      await Promise.all([
        tx.user.create({ data: user1 }),
        tx.user.create({ data: user2 }),
        tx.user.create({ data: user3 }),
      ]);

      // User 1 answers questions on consecutive days
      await tx.questionAnswer.createMany({
        data: [
          {
            questionOptionId: questions[0].questionOptions[0].id, // User 1 answers "Yes" to "Is the sky blue?"
            selected: true,
            timeToAnswer: 100,
            status: AnswerStatus.Submitted,
            userId: user1.id,
            percentage: 50,
            createdAt: new Date(),
          },
          {
            questionOptionId: questions[1].questionOptions[0].id, // User 1 answers "Yes" to "Is water wet?"
            selected: true,
            timeToAnswer: 100,
            status: AnswerStatus.Submitted,
            userId: user1.id,
            percentage: 50,
            createdAt: subDays(new Date(), 1),
          },
          {
            questionOptionId: questions[2].questionOptions[1].id, // User 1 answers "No" to "Is the earth flat?"
            selected: false,
            timeToAnswer: 100,
            status: AnswerStatus.Submitted,
            userId: user1.id,
            percentage: 50,
            createdAt: subDays(new Date(), 2),
          },
        ],
      });

      // User 2 answers questions but has a gap (2 consecutive days, then 1 day gap)
      await tx.questionAnswer.createMany({
        data: [
          {
            questionOptionId: questions[0].questionOptions[0].id, // User 2 answers "Yes"
            selected: true,
            timeToAnswer: 100,
            status: AnswerStatus.Submitted,
            userId: user2.id,
            percentage: 50,
            createdAt: new Date(),
          },
          {
            questionOptionId: questions[1].questionOptions[0].id, // User 2 answers "Yes"
            selected: true,
            timeToAnswer: 100,
            status: AnswerStatus.Submitted,
            userId: user2.id,
            percentage: 50,
            createdAt: subDays(new Date(), 2),
          },
          // User 2 does not answer on October 13
          {
            questionOptionId: questions[2].questionOptions[0].id, // User 2 answers on October 14
            selected: true,
            timeToAnswer: 100,
            status: AnswerStatus.Submitted,
            userId: user2.id,
            percentage: 50,
            createdAt: subDays(new Date(), 4),
          },
        ],
      });

      // User 3 answers questions only once
      await tx.questionAnswer.createMany({
        data: [
          {
            questionOptionId: questions[0].questionOptions[1].id, // User 3 answers "No" (incorrect)
            selected: false,
            timeToAnswer: 100,
            status: AnswerStatus.Submitted,
            userId: user3.id,
            percentage: 50,
            createdAt: new Date(),
          },
        ],
      });

      // User 1 has revealed all questions
      await Promise.all([
        tx.chompResult.create({
          data: {
            userId: user1.id,
            result: ResultType.Revealed,
            questionId: questions[0].id,
            createdAt: new Date(),
            transactionStatus: TransactionStatus.Completed,
            burnTransactionSignature:
              "49azuPTnLn64D8wZbygWqdvyuzgJtfdYKL76vfsKLUQkaf27wQbfZCdbVxj2VvrgG2eRoEZwLqFPGVK7aYwZGyD1",
          },
        }),
        tx.chompResult.create({
          data: {
            userId: user1.id,
            result: ResultType.Revealed,
            questionId: questions[1].id,
            createdAt: new Date(),
            transactionStatus: TransactionStatus.Completed,
            burnTransactionSignature:
              "49azuPTnLn64D8wZbygWqdvyuzgJtfdYKL76vfsKLUQkaf27wQbfZCdbVxj2VvrgG2eRoEZwLqFPGVK7aYwZGyD2",
          },
        }),
        tx.chompResult.create({
          data: {
            userId: user1.id,
            result: ResultType.Revealed,
            questionId: questions[2].id,
            createdAt: new Date(),
            transactionStatus: TransactionStatus.Completed,
            burnTransactionSignature:
              "49azuPTnLn64D8wZbygWqdvyuzgJtfdYKL76vfsKLUQkaf27wQbfZCdbVxj2VvrgG2eRoEZwLqFPGVK7aYwZGyD3",
          },
        }),
      ]);

      // User 2 has revealed questions with a gap
      await Promise.all([
        tx.chompResult.create({
          data: {
            userId: user2.id,
            result: ResultType.Revealed,
            questionId: questions[0].id,
            createdAt: new Date(),
            transactionStatus: TransactionStatus.Completed,
            burnTransactionSignature:
              "49azuPTnLn64D8wZbygWqdvyuzgJtfdYKL76vfsKLUQkaf27wQbfZCdbVxj2VvrgG2eRoEZwLqFPGVK7aYwZGyD4",
          },
        }),
        tx.chompResult.create({
          data: {
            userId: user2.id,
            result: ResultType.Revealed,
            questionId: questions[1].id,
            createdAt: new Date(),
            transactionStatus: TransactionStatus.Completed,
            burnTransactionSignature:
              "49azuPTnLn64D8wZbygWqdvyuzgJtfdYKL76vfsKLUQkaf27wQbfZCdbVxj2VvrgG2eRoEZwLqFPGVK7aYwZGyD5",
          },
        }),
        // User 2 does not reveal question on October 13
        tx.chompResult.create({
          data: {
            userId: user2.id,
            result: ResultType.Revealed,
            questionId: questions[2].id,
            createdAt: new Date(),
            transactionStatus: TransactionStatus.Completed,
            burnTransactionSignature:
              "49azuPTnLn64D8wZbygWqdvyuzgJtfdYKL76vfsKLUQkaf27wQbfZCdbVxj2VvrgG2eRoEZwLqFPGVK7aYwZGyD6",
          },
        }),
      ]);

      // User 3 has only revealed one question
      await tx.chompResult.create({
        data: {
          userId: user3.id,
          result: ResultType.Revealed,
          questionId: questions[0].id,
          createdAt: new Date(),
          transactionStatus: TransactionStatus.Completed,
          burnTransactionSignature:
            "49azuPTnLn64D8wZbygWqdvyuzgJtfdYKL76vfsKLUQkaf27wQbfZCdbVxj2VvrgG2eRoEZwLqFPGVK7aYwZGyD7",
        },
      });
    });
  });

  afterAll(async () => {
    await prisma.$transaction(async (tx) => {
      await tx.chompResult.deleteMany({
        where: {
          userId: { in: [user1.id, user2.id, user3.id] },
        },
      });
      await tx.questionAnswer.deleteMany({
        where: {
          userId: { in: [user1.id, user2.id, user3.id] },
        },
      });
      await tx.questionOption.deleteMany({
        where: {
          questionId: { in: questionsIds },
        },
      });
      await tx.question.deleteMany({
        where: {
          id: { in: questionsIds },
        },
      });
      await tx.user.deleteMany({
        where: {
          id: { in: [user1.id, user2.id, user3.id] },
        },
      });
    });
  });

  it("should return the latest streak for user1 ending today", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ sub: user1.id });
    const latestStreak = await getUsersLatestStreak();

    expect(latestStreak).toBe(3); // User1's streak ends today after answering for 3 consecutive days
  });

  it("should return the latest streak for user2 ending today", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ sub: user2.id });
    const latestStreak = await getUsersLatestStreak();

    expect(latestStreak).toBe(1); // User2's streak ends today after answering today but skipped the previous day
  });

  it("should return the latest streak for user3 ending today", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ sub: user3.id });
    const latestStreak = await getUsersLatestStreak();

    expect(latestStreak).toBe(1); // User3's streak ends today after answering on one day only
  });
});
