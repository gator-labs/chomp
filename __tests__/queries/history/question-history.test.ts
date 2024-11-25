import { getQuestionsHistoryQuery } from "@/app/queries/history";
import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";
import { QuestionType, Token } from "@prisma/client";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

describe("getQuestionsHistoryQuery", () => {
  const user1 = {
    id: uuidv4(),
    username: `user1`,
  };

  let deckId: number;
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
        },
      });

      deckId = deck.id;

      // Create questions for decks
      const questions = await Promise.all([
        tx.question.create({
          data: {
            question: "Is the sky blue?",
            type: QuestionType.BinaryQuestion,
            revealAtDate: futureDate,
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
            revealAtDate: pastDate,
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
      ]);

      questionIds = questions.map((q) => q.id);

      await tx.deckQuestion.createMany({
        data: [
          { deckId: deckId, questionId: questions[0].id },
          { deckId: deckId, questionId: questions[1].id },
        ],
      });

      // Create users
      await Promise.all([tx.user.create({ data: user1 })]);

      // Create answers for user1
      await tx.questionAnswer.createMany({
        data: questions.flatMap((question) =>
          question.questionOptions.map((qo, i) => ({
            questionOptionId: qo.id,
            userId: user1.id,
            selected: i === 0,
          })),
        ),
      });

      const minAnswersPerQuestion = Number(
        process.env.MINIMAL_ANSWERS_PER_QUESTION ?? 0,
      );

      if (minAnswersPerQuestion > 0) {
        otherUsers = await generateUsers(minAnswersPerQuestion);

        await tx.user.createMany({
          data: otherUsers,
        });

        for (let userIdx = 0; userIdx < minAnswersPerQuestion; userIdx++) {
          await tx.questionAnswer.createMany({
            data: questions.flatMap((question) =>
              question.questionOptions.map((qo, i) => ({
                questionOptionId: qo.id,
                userId: otherUsers[userIdx].id,
                selected: i === 0,
              })),
            ),
          });
        }
      }
    });
  });

  afterAll(async () => {
    // Clean up the data after the test
    await prisma.$transaction(async (tx) => {
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
      await tx.user.deleteMany({ where: { id: { equals: user1.id } } });

      if (otherUsers.length > 0) {
        await tx.user.deleteMany({
          where: { id: { in: otherUsers.map((user) => user.id) } },
        });
      }
    });
  });

  it("should return ready-to-reveal question for user1", async () => {
    const result = await getQuestionsHistoryQuery(
      user1.id,
      100,
      1,
      deckId,
      "isRevealable",
    );

    expect(result.length).toBe(1);
    expect(result.every((r) => r.isRevealable)).toBeTruthy();
  });

  it("should return both questions for user1", async () => {
    const result = await getQuestionsHistoryQuery(
      user1.id,
      100,
      1,
      deckId,
      "all",
    );

    expect(result.length).toBe(2);
  });
});
