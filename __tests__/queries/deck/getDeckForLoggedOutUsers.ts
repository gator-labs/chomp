import prisma from "@/app/services/prisma";
import { QuestionType, Token } from '@prisma/client';
import { TestDataGenerator } from '../../data_gen/deck';


describe('queries/deck/getDeckForLoggedOutUsers', () => {
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
            },
          ],
        },
      ],
      users: [
        { id: 'user1', username: 'testuser1' },
        { id: 'user2', username: 'testuser2' },
      ],
      answers: [
        { userId: 'user1', questionId: 1, selectedOptionIndex: 0 },
        { userId: 'user2', questionId: 1, selectedOptionIndex: 0 },
      ],
    });
  });

  afterAll(async () => {
    await TestDataGenerator.cleanup(testData);
  });

  it('should have created test data', async () => {
    const deck = await prisma.deck.findUnique({
      where: { id: testData.deckIds[0] },
    });
    expect(deck).toBeTruthy();
  });
});
