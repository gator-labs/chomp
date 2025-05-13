import {
  TestDataGenerator,
  TestScenarioResult,
} from "@/__tests__/__utils__/data-gen";
import { getJwtPayload } from "@/app/actions/jwt";
import { getStack } from "@/app/queries/stack";
import prisma from "@/app/services/prisma";
import { yesterdayStartUTC } from "@/app/utils/date";
import { QuestionType, Token } from "@prisma/client";
import dayjs from "dayjs";

const { generateRandomUserId, createEmptyTestScenarioResult } =
  TestDataGenerator;

// Mock JWT payload since it's used in getStack
jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));

describe("getStack", () => {
  let stackId: number;
  let createdDeckIds: number[] = [];

  let testData: TestScenarioResult;

  beforeAll(async () => {
    // Create a test stack
    const createdStack = await prisma.stack.create({
      data: {
        name: "Test Stack",
        isActive: true,
        isVisible: true,
        image: "https://example.com/test-stack-image.jpg", // Required field from schema
      },
    });
    stackId = createdStack.id;

    // Create decks with various date combinations to test sorting
    const baseDate = new Date();
    baseDate.setUTCHours(12, 0, 0, 0); // Set to noon UTC to avoid day boundary issues

    const yesterday = new Date(baseDate);
    yesterday.setUTCDate(baseDate.getUTCDate() - 1);

    const tomorrow = new Date(baseDate);
    tomorrow.setUTCDate(baseDate.getUTCDate() + 1);

    const nextWeek = new Date(baseDate);
    nextWeek.setUTCDate(baseDate.getUTCDate() + 7);

    const lastWeek = new Date(baseDate);
    lastWeek.setUTCDate(baseDate.getUTCDate() - 7);

    const deckData = [
      // 1. Deck with null revealAtDate (should appear first)
      {
        data: {
          deck: "Deck 1 - Null Reveal Date",
          revealAtDate: null,
          activeFromDate: yesterday,
          stackId: createdStack.id,
        },
      },
      {
        data: {
          deck: "Deck 2 - Null Reveal Date",
          revealAtDate: null,
          activeFromDate: tomorrow,
          stackId: createdStack.id,
        },
      },
      {
        data: {
          deck: "Deck 3 - Future Reveal",
          revealAtDate: nextWeek,
          activeFromDate: yesterday, // Past active date (makes it open)
          stackId: createdStack.id,
        },
      },
      {
        data: {
          deck: "Deck 4 - Same Reveal as 5",
          revealAtDate: tomorrow,
          activeFromDate: yesterday, // Past active date (makes it open)
          stackId: createdStack.id,
        },
      },
      {
        data: {
          deck: "Deck 5 - Same Reveal as 4",
          revealAtDate: tomorrow,
          activeFromDate: nextWeek, // Future active date (makes it upcoming)
          stackId: createdStack.id,
        },
      },
      {
        data: {
          deck: "Deck 6 - Open Now",
          revealAtDate: dayjs().add(2, "days").toDate(), // Between tomorrow and nextWeek
          activeFromDate: lastWeek, // Past active date (makes it open)
          stackId: createdStack.id,
        },
      },
      {
        data: {
          deck: "Deck 7 - Closed",
          revealAtDate: yesterday, // Past reveal date (makes it closed)
          activeFromDate: lastWeek,
          stackId: createdStack.id,
        },
      },
    ];

    const decks = [];

    for (let i = 0; i < deckData.length; i++) {
      const deck = await prisma.deck.create({
        data: deckData[i].data,
      });
      decks.push(deck);
    }

    createdDeckIds = decks.map((deck) => deck.id);
  });

  beforeEach(function () {
    testData = createEmptyTestScenarioResult();
  });

  afterEach(async () => {
    await TestDataGenerator.cleanup(testData);
  });

  afterAll(async () => {
    // Clean up decks
    await prisma.deck.deleteMany({
      where: {
        id: {
          in: createdDeckIds,
        },
      },
    });

    // Clean up stack
    await prisma.stack.delete({
      where: {
        id: stackId,
      },
    });
  });

  it("should return null for non-existent stack", async () => {
    const result = await getStack(999999);
    expect(result).toBeNull();
  });

  it("should sort decks with null revealAtDate first", async () => {
    const result = await getStack(stackId);
    expect(result).not.toBeNull();

    // First two decks should be the ones with null revealAtDate
    expect(result!.deck[0].revealAtDate).toBeNull();
    expect(result!.deck[1].revealAtDate).toBeNull();

    // Verify they are sorted by activeFromDate (yesterday before tomorrow)
    expect(result!.deck[0].deck).toBe("Deck 1 - Null Reveal Date"); // yesterday
    expect(result!.deck[1].deck).toBe("Deck 2 - Null Reveal Date"); // tomorrow
  });

  it("should sort open decks by revealAtDate in ascending order after null dates", async () => {
    const result = await getStack(stackId);
    expect(result).not.toBeNull();

    // After null dates, open decks should be sorted by revealAtDate ascending
    const nonNullDecks = result!.deck.slice(2);
    expect(nonNullDecks[0].deck).toBe("Deck 4 - Same Reveal as 5"); // Tomorrow
    expect(nonNullDecks[1].deck).toBe("Deck 6 - Open Now"); // Day after tomorrow
    expect(nonNullDecks[2].deck).toBe("Deck 3 - Future Reveal"); // Next week
  });

  it("should sort decks with same revealAtDate by activeFromDate status", async () => {
    const result = await getStack(stackId);
    expect(result).not.toBeNull();

    // Find the two decks with same revealAtDate (tomorrow)
    const sameRevealDecks = result!.deck.filter((d) =>
      d.deck.includes("Same Reveal"),
    );
    expect(sameRevealDecks).toHaveLength(2);

    // Deck4 (past active date) should come before Deck5 (future active date)
    expect(sameRevealDecks[0].deck).toBe("Deck 4 - Same Reveal as 5");
    expect(sameRevealDecks[1].deck).toBe("Deck 5 - Same Reveal as 4");
  });

  it("should maintain the stack structure with all fields", async () => {
    const result = await getStack(stackId);
    expect(result).not.toBeNull();

    // Verify stack fields are preserved
    expect(result).toHaveProperty("id", stackId);
    expect(result).toHaveProperty("name", "Test Stack");
    expect(result).toHaveProperty("isActive", true);
    expect(result).toHaveProperty("isVisible", true);
    expect(result).toHaveProperty("image");
    expect(result).toHaveProperty("deck");
    expect(Array.isArray(result!.deck)).toBe(true);
  });

  it("should correctly sort mixed states (open, upcoming, and closed decks)", async () => {
    const result = await getStack(stackId);
    expect(result).not.toBeNull();

    // Find decks by their state based on sorting logic
    // Find an open deck (Deck 4 or 6)
    const openDeck = result!.deck.find(
      (d) => d.deck.includes("Deck 4") || d.deck.includes("Deck 6"),
    );

    // Find an upcoming deck (Deck 5)
    const upcomingDeck = result!.deck.find((d) => d.deck.includes("Deck 5"));

    // Find a closed deck (Deck 7)
    const closedDeck = result!.deck.find((d) => d.deck.includes("Deck 7"));

    // Verify open decks come before upcoming decks
    if (openDeck && upcomingDeck) {
      const openIndex = result!.deck.indexOf(openDeck);
      const upcomingIndex = result!.deck.indexOf(upcomingDeck);
      expect(openIndex).toBeLessThan(upcomingIndex);
    }

    // Verify upcoming decks come before closed decks
    if (upcomingDeck && closedDeck) {
      const upcomingIndex = result!.deck.indexOf(upcomingDeck);
      const closedIndex = result!.deck.indexOf(closedDeck);
      expect(upcomingIndex).toBeLessThan(closedIndex);
    }
  });

  it("should handle boundary dates (exactly now)", async () => {
    const now = new Date();

    // Create a deck that starts exactly now
    const deckData = [
      {
        data: {
          deck: "Deck - Starting Now",
          revealAtDate: dayjs().add(1, "day").toDate(),
          activeFromDate: now,
          stackId: stackId,
        },
      },
      {
        data: {
          deck: "Deck - Revealing Now",
          revealAtDate: now,
          activeFromDate: dayjs().subtract(1, "day").toDate(),
          stackId: stackId,
        },
      },
    ];

    const decks = [];

    for (let i = 0; i < deckData.length; i++) {
      const deck = await prisma.deck.create({
        data: deckData[i].data,
      });
      decks.push(deck);
    }

    const deckIds = decks.map((deck) => deck.id);

    const result = await getStack(stackId);
    expect(result).not.toBeNull();

    // Find our boundary test decks
    const startingNowDeck = result!.deck.find(
      (d) => d.deck === "Deck - Starting Now",
    );
    const revealingNowDeck = result!.deck.find(
      (d) => d.deck === "Deck - Revealing Now",
    );

    expect(startingNowDeck).toBeDefined();
    expect(revealingNowDeck).toBeDefined();

    // A deck starting now should be considered "open"
    // A deck revealing now should be considered "closed"
    const startingNowIndex = result!.deck.indexOf(startingNowDeck!);
    const revealingNowIndex = result!.deck.indexOf(revealingNowDeck!);
    expect(startingNowIndex).toBeLessThan(revealingNowIndex);

    // Clean up decks
    await prisma.deck.deleteMany({
      where: {
        id: { in: deckIds },
      },
    });
  });

  it("should handle missing or invalid date combinations", async () => {
    const deckData = [
      {
        data: {
          deck: "Deck - Missing ActiveFrom",
          revealAtDate: dayjs().add(1, "day").toDate(),
          activeFromDate: null,
          stackId: stackId,
        },
      },
      {
        data: {
          deck: "Deck - Missing Reveal",
          revealAtDate: null,
          activeFromDate: dayjs().subtract(1, "day").toDate(),
          stackId: stackId,
        },
      },
    ];

    const decks = [];

    for (let i = 0; i < deckData.length; i++) {
      const deck = await prisma.deck.create({
        data: deckData[i].data,
      });
      decks.push(deck);
    }

    const deckIds = decks.map((deck) => deck.id);

    const result = await getStack(stackId);
    expect(result).not.toBeNull();

    // Verify decks with missing dates are included in results
    const missingActiveDeck = result!.deck.find(
      (d) => d.deck === "Deck - Missing ActiveFrom",
    );
    const missingRevealDeck = result!.deck.find(
      (d) => d.deck === "Deck - Missing Reveal",
    );

    expect(missingActiveDeck).toBeDefined();
    expect(missingRevealDeck).toBeDefined();

    // Clean up decks
    await prisma.deck.deleteMany({
      where: {
        id: { in: deckIds },
      },
    });
  });

  it("should correctly include totalRewardAmount and creditCostPerQuestion fields", async () => {
    // Create a deck with questions having different credit costs using TestDataGenerator
    const testScenario = await TestDataGenerator.createTestScenario({
      stack: {
        name: "Rewards Test Stack",
        isActive: true,
        isVisible: true,
        image: "https://example.com/rewards-stack-image.jpg",
      },
      decks: [
        {
          deck: {
            deck: "Deck with Rewards Test",
            revealAtDate: null,
            activeFromDate: yesterdayStartUTC(),
          },
          questions: [
            {
              question: "Question 1",
              type: QuestionType.BinaryQuestion,
              revealTokenAmount: 3,
              creditCostPerQuestion: 4,
              options: [],
            },
            {
              question: "Question 2",
              type: QuestionType.BinaryQuestion,
              revealTokenAmount: 7,
              creditCostPerQuestion: 2,
              options: [],
            },
          ],
        },
      ],
    });

    // Add data to the cleanup list
    testData.stackIds.push(...testScenario.stackIds);
    testData.deckIds.push(...testScenario.deckIds);
    testData.questionIds.push(...testScenario.questionIds);

    const result = await getStack(testScenario.stackIds[0]!);
    expect(result).not.toBeNull();

    // Find our test deck in the results
    const testDeck = result!.deck.find(
      (d) => d.deck === "Deck with Rewards Test",
    );
    expect(testDeck).toBeDefined();

    // sum of question.creditCostPerQuestion of each question (3 + 7 = 10)
    expect(testDeck).toHaveProperty("totalRewardAmount", 10);

    // Sum of question.creditCostPerQuestion (4 + 2 = 6)
    expect(testDeck).toHaveProperty("totalCreditCost", 6);
  });

  it("should correctly include answeredQuestions count for each deck", async () => {
    const user1 = generateRandomUserId();
    const user2 = generateRandomUserId();

    const testScenario = await TestDataGenerator.createTestScenario({
      users: [
        { id: user1, username: "testuser_a" },
        { id: user2, username: "testuser_b" },
      ],
      stack: {
        name: "Answered Questions Test Stack",
        isActive: true,
        isVisible: true,
        image: "https://example.com/answered-questions-stack-image.jpg",
      },
      decks: [
        {
          deck: {
            deck: "Test Deck totalRewardAmount",
            revealAtDate: null,
            activeFromDate: yesterdayStartUTC(),
          },
          questions: [
            // Binary question 1
            {
              question: "Binary Question 1",
              type: QuestionType.BinaryQuestion,
              revealToken: Token.Bonk,
              revealTokenAmount: 5,
              options: [
                {
                  index: 0,
                  option: "Yes",
                  isLeft: true,
                  isCorrect: true,
                  answers: [{ userId: user1, selected: true }],
                },
                {
                  index: 1,
                  option: "No",
                  isLeft: false,
                  isCorrect: false,
                  answers: [{ userId: user2, selected: true }],
                },
              ],
            },
            // Binary question 2
            {
              question: "Binary Question 2",
              type: QuestionType.BinaryQuestion,
              revealToken: Token.Bonk,
              revealTokenAmount: 5,
              options: [
                {
                  index: 0,
                  option: "True",
                  isLeft: true,
                  isCorrect: true,
                  answers: [{ userId: user1, selected: true }],
                },
                {
                  index: 1,
                  option: "False",
                  isLeft: false,
                  isCorrect: false,
                  answers: [{ userId: user2, selected: true }],
                },
              ],
            },
            // Multiple choice question 1
            {
              question: "Multiple Choice Question 1",
              type: QuestionType.MultiChoice,
              revealToken: Token.Bonk,
              revealTokenAmount: 5,
              options: [
                {
                  index: 0,
                  option: "Option A",
                  isLeft: true,
                  isCorrect: true,
                  answers: [{ userId: user1, selected: true }],
                },
                {
                  index: 1,
                  option: "Option B",
                  isLeft: false,
                  isCorrect: false,
                  answers: [{ userId: user2, selected: false }],
                },
                {
                  index: 2,
                  option: "Option C",
                  isLeft: false,
                  isCorrect: false,
                  answers: [],
                },
              ],
            },
            // Multiple choice question 2
            {
              question: "Multiple Choice Question 2",
              type: QuestionType.MultiChoice,
              revealToken: Token.Bonk,
              revealTokenAmount: 5,
              options: [
                {
                  index: 0,
                  option: "Choice 1",
                  isLeft: true,
                  isCorrect: false,
                  answers: [],
                },
                {
                  index: 1,
                  option: "Choice 2",
                  isLeft: false,
                  isCorrect: true,
                  answers: [{ userId: user1, selected: false }],
                },
                {
                  index: 2,
                  option: "Choice 3",
                  isLeft: false,
                  isCorrect: false,
                  answers: [],
                },
              ],
            },
          ],
        },
      ],
    });

    // Add data to the cleanup list
    testData.stackIds.push(...testScenario.stackIds);
    testData.deckIds.push(...testScenario.deckIds);
    testData.questionIds.push(...testScenario.questionIds);
    testData.userIds.push(...testScenario.userIds);

    // Mock the return value of getJwtPayload to simulate the user context
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: user1,
    });

    // Get the stack with the deck
    const result = await getStack(testScenario.stackIds[0]!);
    expect(result).not.toBeNull();

    // Find our test deck in the results
    const testDeck = result!.deck.find(
      (d) => d.deck === "Test Deck totalRewardAmount",
    );
    expect(testDeck).toBeDefined();

    // User 1 has answered 4 questions
    expect(testDeck).toHaveProperty("answeredQuestions", 4);

    // Mock the return value of getJwtPayload to simulate the user context
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: user2,
    });

    const resultForUser2 = await getStack(testScenario.stackIds[0]!);
    const testDeckForUser2 = resultForUser2!.deck.find(
      (d) => d.deck === "Test Deck totalRewardAmount",
    );

    // User 2 has answered 3 questions
    expect(testDeckForUser2).toHaveProperty("answeredQuestions", 3);
  });
});
