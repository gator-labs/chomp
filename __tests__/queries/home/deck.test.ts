import { queryExpiringDecks } from "@/app/queries/home";
import prisma from "@/app/services/prisma";
import { QuestionType, Token } from "@prisma/client";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

jest.mock("p-retry", () => ({
  retry: jest.fn((fn) => fn()),
}));

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

  let existingDeckIds = {};

  beforeAll(async () => {
    // Gather any existing decks from the database so we can
    // exclude them from the results later on
    const existingDecks = await prisma.deck.findMany({
      select: {
        id: true,
      },
      where: {
        revealAtDate: {
          gt: new Date(),
        },
      },
    });

    existingDeckIds = Object.fromEntries(
      existingDecks.map((deck) => [deck.id, true]),
    );

    // Create decks
    const deckData = [
      {
        data: {
          deck: "Deck 1",
          activeFromDate: dayjs().startOf("day").toDate(),
          revealAtDate: dayjs().add(1, "day").toDate(),
        },
      },
      {
        data: {
          deck: "Deck 2",
          activeFromDate: dayjs().startOf("day").toDate(),
          revealAtDate: dayjs().add(1, "day").toDate(),
        },
      },
    ];

    const decks = [];

    for (const deck of deckData) {
      const createdDeck = await prisma.deck.create({
        data: deck.data,
      });
      decks.push(createdDeck);
    }

    deckIds = decks.map((deck) => deck.id);

    // Create questions for decks
    const questions = await Promise.all([
      prisma.question.create({
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
      prisma.question.create({
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

    await prisma.deckQuestion.createMany({
      data: [
        { deckId: decks[0].id, questionId: questions[0].id },
        { deckId: decks[1].id, questionId: questions[1].id },
      ],
    });

    // Create users
    await Promise.all([
      prisma.user.create({ data: user1 }),
      prisma.user.create({ data: user2 }),
    ]);

    // Create answers for user1
    await prisma.questionAnswer.createMany({
      data: questions.flatMap((question) =>
        question.questionOptions.map((qo, i) => ({
          questionOptionId: qo.id,
          userId: user1.id,
          selected: i === 0,
        })),
      ),
    });

    await prisma.questionAnswer.createMany({
      data: questions[0].questionOptions.map((qo, i) => ({
        questionOptionId: qo.id,
        userId: user2.id,
        selected: i === 0,
      })),
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
    });
  });

  it("should return decks expiring today with unanswered questions for user2", async () => {
    const result = (await queryExpiringDecks(user2.id)).filter(
      (deck: any) => !(deck.id in existingDeckIds),
    );

    expect(result.length).toBe(1); // Only Deck 2 has unanswered questions for user2
    expect(result[0].deck).toBe("Deck 2");
  });

  it("should return an empty array for user1 as all questions are answered", async () => {
    const result = (await queryExpiringDecks(user1.id)).filter(
      (deck: any) => !(deck.id in existingDeckIds),
    );

    expect(result.length).toBe(0); // user1 has answered all the questions in both decks
  });
});
