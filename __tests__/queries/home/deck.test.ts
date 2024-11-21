import { queryExpiringDecks } from "@/app/queries/home";
import prisma from "@/app/services/prisma";
import { QuestionType, Token } from "@prisma/client";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

describe("queryExpiringDecks", () => {
  const user1 = {
    id: uuidv4(),
    username: `user1`,
  };

  const user2 = {
    id: uuidv4(),
    username: `user2`,
  };

  let deckIds: number[] = [];
  let questionIds: number[] = [];

  beforeAll(async () => {
    await prisma.$transaction(async (tx) => {
      // Ensure there are no expiring decks already in the system
      await tx.$queryRaw`
        UPDATE "Deck" SET "revealAtDate" = "revealAtDate" - INTERVAL '5 years'
      `;

      // Create decks
      const decks = await Promise.all([
        tx.deck.create({
          data: {
            deck: "Deck 1",
            date: new Date(),
            revealAtDate: dayjs().add(1, "day").toDate(),
          },
        }),
        tx.deck.create({
          data: {
            deck: "Deck 2",
            date: new Date(),
            revealAtDate: dayjs().add(1, "day").toDate(),
          },
        }),
      ]);

      deckIds = decks.map((deck) => deck.id);

      // Create questions for decks
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
      ]);

      questionIds = questions.map((q) => q.id);

      await tx.deckQuestion.createMany({
        data: [
          { deckId: decks[0].id, questionId: questions[0].id },
          { deckId: decks[1].id, questionId: questions[1].id },
        ],
      });

      // Create users
      await Promise.all([
        tx.user.create({ data: user1 }),
        tx.user.create({ data: user2 }),
      ]);

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

      await tx.questionAnswer.createMany({
        data: questions[0].questionOptions.map((qo, i) => ({
          questionOptionId: qo.id,
          userId: user2.id,
          selected: i === 0,
        })),
      });
    });
  });

  afterAll(async () => {
    // Clean up the data after the test
    await prisma.$transaction(async (tx) => {
      await tx.questionAnswer.deleteMany({
        where: { userId: { in: [user1.id, user2.id] } },
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
      await tx.deck.deleteMany({ where: { id: { in: deckIds } } });
      await tx.user.deleteMany({ where: { id: { in: [user1.id, user2.id] } } });

      // Reset dates that were changed for the test
      await tx.$queryRaw`
        UPDATE "Deck" SET "revealAtDate" = "revealAtDate" + INTERVAL '5 years'
      `;
    });
  });

  it("should return decks expiring today with unanswered questions for user2", async () => {
    const result = await queryExpiringDecks(user2.id);

    console.log(result);

    expect(result.length).toBe(1); // Only Deck 2 has unanswered questions for user2
    expect(result[0].deck).toBe("Deck 2");
  });

  it("should return an empty array for user1 as all questions are answered", async () => {
    const result = await queryExpiringDecks(user1.id);

    console.log(result);

    expect(result.length).toBe(0); // user1 has answered all the questions in both decks
  });
});
