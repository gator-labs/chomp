import { getDeckForLoggedOutUsers } from "@/app/queries/deck";
import { QuestionType } from "@prisma/client";

import { TestDataGenerator } from "../../../lib/data_gen/deck";

describe("queries/deck/getDeckForLoggedOutUsers", () => {
  let testData: {
    deckIds: number[];
    questionIds: number[];
    userIds: string[];
  };

  beforeAll(async () => {
    testData = await TestDataGenerator.createTestScenario({
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
              options: [
                {
                  option: "Yes",
                  isLeft: true,
                  isCorrect: true,
                  calculatedPercentageOfSelectedAnswers: 80,
                  calculatedAveragePercentage: 70,
                },
                {
                  option: "No",
                  isLeft: false,
                  isCorrect: false,
                  calculatedPercentageOfSelectedAnswers: 20,
                  calculatedAveragePercentage: 30,
                },
              ],
              creditCostPerQuestion: 3,
              revealTokenAmount: 11,
            },
            {
              question: "What is sandwitch?",
              type: QuestionType.BinaryQuestion,
              options: [
                {
                  option: "Yes",
                  isLeft: true,
                  isCorrect: true,
                  calculatedPercentageOfSelectedAnswers: 80,
                  calculatedAveragePercentage: 70,
                },
                {
                  option: "No",
                  isLeft: false,
                  isCorrect: false,
                  calculatedPercentageOfSelectedAnswers: 20,
                  calculatedAveragePercentage: 30,
                },
              ],
              revealTokenAmount: 3,
              creditCostPerQuestion: 2,
            },
          ],
        }, // deck 0
      ],
      users: [
        { id: "user1", username: "testuser1" },
        { id: "user2", username: "testuser2" },
      ],
      answers: [
        { userId: "user1", questionId: 1, selectedOptionIndex: 0 },
        { userId: "user2", questionId: 1, selectedOptionIndex: 0 },
      ],
    });
  });

  afterAll(async () => {
    await TestDataGenerator.cleanup(testData);
  });

  it("should get deck with questions, cost and rewards", async () => {
    const deck = await getDeckForLoggedOutUsers(testData.deckIds[0]);

    expect(deck).toBeTruthy();
    expect(deck?.totalDeckQuestions).toEqual(2);
    expect(deck?.questions?.length).toEqual(2);
    expect(deck?.deckCreditCost).toEqual(5);
    expect(deck?.deckRewardAmount).toEqual(14);
    expect(deck?.deckInfo?.heading).toEqual("Super deck");
  });
});
