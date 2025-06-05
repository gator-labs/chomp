import { getActiveDeckForLoggedOutUsers } from "@/app/queries/deck";
import prisma from "@/app/services/prisma";
import "@/app/utils/date";
import { QuestionType, Token } from "@prisma/client";
import dayjs from "dayjs";

import {
  TestDataGenerator,
  TestScenarioResult,
} from "../../__utils__/data-gen";

const { generateRandomUserId } = TestDataGenerator;

describe("queries/deck/getActiveDeckForLoggedOutUsers", () => {
  let testData: TestScenarioResult;

  beforeAll(async () => {
    const user1 = generateRandomUserId();
    const user2 = generateRandomUserId();

    testData = await TestDataGenerator.createTestScenario({
      users: [
        { id: user1, username: "testuser1" },
        { id: user2, username: "testuser2" },
      ],
      decks: [
        {
          deck: {
            deck: "Test Deck 1",
            activeFromDate: new Date(),
            revealAtDate: TestDataGenerator.getTomorrow(),
            heading: "Super deck",
          },
          questions: [
            {
              question: "Is this a test question?",
              type: QuestionType.BinaryQuestion,
              revealToken: Token.Bonk,
              revealTokenAmount: 11,
              revealAtDate: TestDataGenerator.getTomorrow(),
              creditCostPerQuestion: 3,
              options: [
                {
                  option: "Yes",
                  isLeft: true,
                  isCorrect: true,
                  calculatedPercentageOfSelectedAnswers: 80,
                  calculatedAveragePercentage: 70,
                  answers: [
                    { userId: user1, selected: true },
                    { userId: user2, selected: true },
                  ],
                  index: 0,
                },
                {
                  option: "No",
                  isLeft: false,
                  isCorrect: false,
                  calculatedPercentageOfSelectedAnswers: 20,
                  calculatedAveragePercentage: 30,
                  index: 1,
                },
              ],
            },
            {
              question: "What is sandwitch?",
              type: QuestionType.BinaryQuestion,
              revealToken: Token.Bonk,
              revealTokenAmount: 3,
              revealAtDate: TestDataGenerator.getTomorrow(),
              creditCostPerQuestion: 2,
              options: [
                {
                  option: "Yes",
                  isLeft: true,
                  isCorrect: true,
                  calculatedPercentageOfSelectedAnswers: 80,
                  calculatedAveragePercentage: 70,
                  index: 0,
                },
                {
                  option: "No",
                  isLeft: false,
                  isCorrect: false,
                  calculatedPercentageOfSelectedAnswers: 20,
                  calculatedAveragePercentage: 30,
                  index: 1,
                },
              ],
            },
          ],
        }, // deck 0
      ],
    });
  });

  afterAll(async () => {
    await TestDataGenerator.cleanup(testData);
  });

  it("should get deck with questions, cost and rewards", async () => {
    const deck = await getActiveDeckForLoggedOutUsers(testData.deckIds[0]);

    expect(deck).toBeTruthy();
    expect(deck?.totalDeckQuestions).toEqual(2);
    expect(deck?.questions?.length).toEqual(2);
    expect(deck?.deckCreditCost).toEqual(5);
    expect(deck?.deckRewardAmount).toEqual(14);
    expect(deck?.deckInfo?.heading).toEqual("Super deck");
  });

  it("should not filter out daily decks", async () => {
    await prisma.deck.update({
      where: {
        id: testData.deckIds[0],
      },
      data: {
        activeFromDate: null, // Indicates a daily deck
      },
    });

    const deck = await getActiveDeckForLoggedOutUsers(testData.deckIds[0]);

    expect(deck).toBeDefined();
  });

  it("should not return a deck that is not active yet", async () => {
    await prisma.deck.update({
      where: {
        id: testData.deckIds[0],
      },
      data: {
        activeFromDate: dayjs().utc().add(1, "day").toDate(),
      },
    });

    const deck = await getActiveDeckForLoggedOutUsers(testData.deckIds[0]);

    expect(deck).toBeFalsy();
  });

  it("should not return a deck that has already been revealed", async () => {
    await prisma.deck.update({
      where: {
        id: testData.deckIds[0],
      },
      data: {
        revealAtDate: dayjs().utc().subtract(1, "day").toDate(),
      },
    });

    const deck = await getActiveDeckForLoggedOutUsers(testData.deckIds[0]);

    expect(deck).toBeFalsy();
  });

  it("should not return a daily deck", async () => {
    await prisma.deck.update({
      where: {
        id: testData.deckIds[0],
      },
      data: {
        activeFromDate: null,
        date: new Date(),
      },
    });

    const deck = await getActiveDeckForLoggedOutUsers(testData.deckIds[0]);

    expect(deck).toBeFalsy();
  });
});
