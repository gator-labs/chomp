import { queryExpiringDecks } from "@/app/queries/home";
import prisma from "@/app/services/prisma";
import { QuestionType, Token } from "@prisma/client";
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
    const now = new Date();
    now.setUTCHours(12, 0, 0, 0); // Set to noon UTC

    // Gather any existing decks from the database so we can
    // exclude them from the results later on
    const existingDecks = await prisma.deck.findMany({
      select: {
        id: true,
      },
      where: {
        revealAtDate: {
          gt: now,
        },
      },
    });

    existingDeckIds = Object.fromEntries(
      existingDecks.map((deck) => [deck.id, true]),
    );

    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    // Create decks
    const deckData = [
      {
        data: {
          deck: "Deck 1",
          activeFromDate: now,
          revealAtDate: tomorrow,
        },
      },
      {
        data: {
          deck: "Deck 2",
          activeFromDate: now,
          revealAtDate: tomorrow,
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
          revealAtDate: tomorrow,
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
          revealAtDate: tomorrow,
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

  it("times should be in UTC", async () => {
    const deckOne = await prisma.deck.findUnique({
      where: {
        id: deckIds[0],
      },
    });

    expect(deckOne?.activeFromDate?.toISOString()).toBe(
      "2025-03-07T12:00:00.000Z",
    );
    expect(deckOne?.revealAtDate?.toISOString()).toBe(
      "2025-03-08T12:00:00.000Z",
    );
  });

  // TODO: should return decks that are partially anwered
  // if only one question is anwered should still return deck
  // if two questions are anwered shoun't return deck

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
