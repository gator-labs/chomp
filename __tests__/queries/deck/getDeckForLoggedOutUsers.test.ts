import { getActiveDeckForLoggedOutUsers } from "@/app/queries/deck";
import prisma from "@/app/services/prisma";
import "@/app/utils/date";
import { QuestionType, Token, ESpecialStack } from "@prisma/client";
import dayjs from "dayjs";

import {
  TestDataGenerator,
  TestScenarioResult,
} from "../../__utils__/data-gen";

const { generateRandomUserId } = TestDataGenerator;

describe("queries/deck/getActiveDeckForLoggedOutUsers", () => {
  let testData: TestScenarioResult;
  let communityAskTestData: TestScenarioResult;
  let communityUser1Id: string;
  let communityUser2Id: string;
  let communityUser3Id: string;
  let origCommunityStack: { id: number } | null;

  beforeAll(async () => {
    const user1 = generateRandomUserId();
    const user2 = generateRandomUserId();

    // Use different user IDs for community ask scenario
    communityUser1Id = TestDataGenerator.generateRandomUserId();
    communityUser2Id = TestDataGenerator.generateRandomUserId();
    communityUser3Id = TestDataGenerator.generateRandomUserId();

    // Check if CommunityAsk stack already exists
    origCommunityStack = await prisma.stack.findUnique({
      where: { specialId: ESpecialStack.CommunityAsk },
    });

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

    // Create test data for CommunityAsk deck with users who have wallets
    communityAskTestData = await TestDataGenerator.createTestScenario({
      users: [
        { 
          id: communityUser1Id, 
          username: "communityUser1",
          profileSrc: "https://example.com/avatar1.jpg"
        },
        { 
          id: communityUser2Id, 
          username: "communityUser2",
          profileSrc: "https://example.com/avatar2.jpg"
        },
        { 
          id: communityUser3Id, 
          username: null,
          profileSrc: "https://example.com/avatar3.jpg"
        },
      ],
      stack: {
        name: "Community Ask Stack",
        specialId: ESpecialStack.CommunityAsk,
        isActive: true,
        isVisible: true,
        image: "community-stack.jpg",
      },
      decks: [
        {
          deck: {
            deck: "Community Ask Deck",
            activeFromDate: new Date(),
            revealAtDate: TestDataGenerator.getTomorrow(),
            heading: "Community Questions",
            description: "Questions from the community",
            imageUrl: "community.png",
            footer: "Community Footer",
            author: "Community",
            authorImageUrl: "community-author.png",
          },
          questions: [
            {
              question: "Community Question 1?",
              type: QuestionType.BinaryQuestion,
              revealToken: Token.Bonk,
              revealTokenAmount: 15,
              revealAtDate: TestDataGenerator.getTomorrow(),
              creditCostPerQuestion: 3,
              durationMiliseconds: 30000,
              options: [
                { option: "CQ1Opt1", isLeft: true, isCorrect: true, index: 0 },
                { option: "CQ1Opt2", isLeft: false, isCorrect: false, index: 1 },
              ],
            },
            {
              question: "Community Question 2?",
              type: QuestionType.BinaryQuestion,
              revealToken: Token.Bonk,
              revealTokenAmount: 25,
              revealAtDate: TestDataGenerator.getTomorrow(),
              creditCostPerQuestion: 4,
              durationMiliseconds: 30000,
              options: [
                { option: "CQ2Opt1", isLeft: true, isCorrect: true, index: 0 },
                { option: "CQ2Opt2", isLeft: false, isCorrect: false, index: 1 },
              ],
            },
            {
              question: "Community Question 3?",
              type: QuestionType.BinaryQuestion,
              revealToken: Token.Bonk,
              revealTokenAmount: 30,
              revealAtDate: TestDataGenerator.getTomorrow(),
              creditCostPerQuestion: 5,
              durationMiliseconds: 30000,
              options: [
                { option: "CQ3Opt1", isLeft: true, isCorrect: true, index: 0 },
                { option: "CQ3Opt2", isLeft: false, isCorrect: false, index: 1 },
              ],
            },
            {
              question: "Community Question 4?",
              type: QuestionType.BinaryQuestion,
              revealToken: Token.Bonk,
              revealTokenAmount: 35,
              revealAtDate: TestDataGenerator.getTomorrow(),
              creditCostPerQuestion: 6,
              durationMiliseconds: 30000,
              options: [
                { option: "CQ4Opt1", isLeft: true, isCorrect: true, index: 0 },
                { option: "CQ4Opt2", isLeft: false, isCorrect: false, index: 1 },
              ],
            },
          ],
        },
      ],
    });

    // Create wallets for the community ask users
    await prisma.wallet.createMany({
      data: [
        { userId: communityUser1Id, address: "wallet1address123" },
        { userId: communityUser2Id, address: "wallet2address456" },
        { userId: communityUser3Id, address: "wallet3address789" },
      ],
    });

    // Update questions to set createdByUserId (TestDataGenerator doesn't support this field)
    if (communityAskTestData.questionIds.length >= 4) {
      await prisma.question.update({
        where: { id: communityAskTestData.questionIds[0] },
        data: { createdByUserId: communityUser1Id },
      });
      await prisma.question.update({
        where: { id: communityAskTestData.questionIds[1] },
        data: { createdByUserId: communityUser2Id },
      });
      await prisma.question.update({
        where: { id: communityAskTestData.questionIds[2] },
        data: { createdByUserId: communityUser3Id },
      });
      await prisma.question.update({
        where: { id: communityAskTestData.questionIds[3] },
        data: { createdByUserId: null },
      });
    }

    // If a CommunityAsk stack already existed, remove it from communityAskTestData.stackIds
    // so TestDataGenerator.cleanup won't try to delete it
    if (origCommunityStack && communityAskTestData.stackIds.includes(origCommunityStack.id)) {
      communityAskTestData.stackIds = communityAskTestData.stackIds.filter(id => id !== origCommunityStack!.id);
    }
  });

  afterAll(async () => {
    // Clean up wallets first
    await prisma.wallet.deleteMany({
      where: { userId: { in: [communityUser1Id, communityUser2Id, communityUser3Id] } },
    });
    
    // Standard cleanup for both test scenarios
    await TestDataGenerator.cleanup(testData);
    await TestDataGenerator.cleanup(communityAskTestData);
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

  describe("Authors functionality", () => {
    beforeAll(async () => {
      // Reset the regular deck to its original state before authors functionality tests
      // Previous tests modify the deck state which affects the authors tests
      await prisma.deck.update({
        where: {
          id: testData.deckIds[0],
        },
        data: {
          activeFromDate: new Date(), // Reset to active
          revealAtDate: TestDataGenerator.getTomorrow(), // Reset to future reveal date
          date: null, // Reset to not be a daily deck
        },
      });
    });

    it("should return empty authors array for regular decks", async () => {
      const result = await getActiveDeckForLoggedOutUsers(testData.deckIds[0]);

      expect(result).not.toBeNull();
      expect(result?.questions?.length).toBeGreaterThan(0);
      
      // Deck should have authors property as empty array for regular decks
      expect(result).toHaveProperty('authors');
      expect(Array.isArray(result!.authors)).toBe(true);
      expect(result!.authors).toEqual([]);
    });

    it("should return populated authors array at deck level for CommunityAsk decks", async () => {
      const result = await getActiveDeckForLoggedOutUsers(communityAskTestData.deckIds[0]);

      expect(result).not.toBeNull();
      expect(result?.questions?.length).toBeGreaterThan(0);

      // Deck should have authors property with populated array
      expect(result).toHaveProperty('authors');
      expect(Array.isArray(result!.authors)).toBe(true);
      expect((result!.authors as any[]).length).toBeGreaterThan(0);
    });

    it("should return correct author structure with address, username, and avatarUrl", async () => {
      const result = await getActiveDeckForLoggedOutUsers(communityAskTestData.deckIds[0]);

      expect(result).not.toBeNull();
      
      // Find the author created by user1Id
      const user1Author = result!.authors?.find(author => author.address === "wallet1address123");

      expect(user1Author).toBeDefined();
      expect(user1Author).toEqual({
        address: "wallet1address123",
        username: "communityUser1",
        avatarUrl: "https://example.com/avatar1.jpg"
      });
    });

    it("should handle authors with missing username (username should be undefined)", async () => {
      const result = await getActiveDeckForLoggedOutUsers(communityAskTestData.deckIds[0]);

      expect(result).not.toBeNull();
      
      // Find the author created by user3Id (who has null username)
      const user3Author = result!.authors?.find(author => author.address === "wallet3address789");

      expect(user3Author).toBeDefined();
      expect(user3Author).toEqual({
        address: "wallet3address789",
        username: undefined,
        avatarUrl: "https://example.com/avatar3.jpg"
      });
    });

    it("should not include authors for questions without createdByUserId", async () => {
      const result = await getActiveDeckForLoggedOutUsers(communityAskTestData.deckIds[0]);

      expect(result).not.toBeNull();
      
      // The authors array should only contain the 3 authors with createdByUserId set
      // (not the question without createdByUserId - Community Question 4)
      expect(result!.authors?.length).toBe(3);
      
      // Verify all expected authors are present
      const addresses = result!.authors?.map(author => author.address) || [];
      expect(addresses).toContain("wallet1address123");
      expect(addresses).toContain("wallet2address456");
      expect(addresses).toContain("wallet3address789");
    });

    it("should return unique authors when questions have different creators", async () => {
      const result = await getActiveDeckForLoggedOutUsers(communityAskTestData.deckIds[0]);

      expect(result).not.toBeNull();
      
      // Should have exactly 3 unique authors (user1, user2, user3)
      expect(result!.authors?.length).toBe(3);
      
      // Check that we have all the expected unique authors
      const user1Author = result!.authors?.find(author => author.address === "wallet1address123");
      const user2Author = result!.authors?.find(author => author.address === "wallet2address456");
      const user3Author = result!.authors?.find(author => author.address === "wallet3address789");
      
      expect(user1Author).toEqual({
        address: "wallet1address123",
        username: "communityUser1",
        avatarUrl: "https://example.com/avatar1.jpg"
      });
      
      expect(user2Author).toEqual({
        address: "wallet2address456", 
        username: "communityUser2",
        avatarUrl: "https://example.com/avatar2.jpg"
      });
      
      expect(user3Author).toEqual({
        address: "wallet3address789",
        username: undefined,
        avatarUrl: "https://example.com/avatar3.jpg"
      });
    });

    it("should handle users without wallets gracefully", async () => {
      // Create a question with a user who doesn't have a wallet
      const userWithoutWallet = TestDataGenerator.generateRandomUserId();
      
      await prisma.user.create({
        data: {
          id: userWithoutWallet,
          username: "userWithoutWallet",
          profileSrc: "https://example.com/no-wallet.jpg"
        }
      });

      // Add a question created by this user to the CommunityAsk deck
      const question = await prisma.question.create({
        data: {
          question: "Question by user without wallet?",
          type: QuestionType.BinaryQuestion,
          revealToken: Token.Bonk,
          revealTokenAmount: 40,
          revealAtDate: TestDataGenerator.getTomorrow(),
          creditCostPerQuestion: 7,
          durationMiliseconds: 30000,
          createdByUserId: userWithoutWallet,
        }
      });

      await prisma.deckQuestion.create({
        data: {
          deckId: communityAskTestData.deckIds[0],
          questionId: question.id,
        }
      });

      const result = await getActiveDeckForLoggedOutUsers(communityAskTestData.deckIds[0]);

      expect(result).not.toBeNull();
      
      // The authors array should still only contain the 3 authors with wallets
      // (the user without wallet should not be included)
      expect(result!.authors?.length).toBe(3);
      
      // Verify the user without wallet is not included
      const authorAddresses = result!.authors?.map(author => author.address) || [];
      expect(authorAddresses).not.toContain(userWithoutWallet);

      // Cleanup
      await prisma.deckQuestion.deleteMany({
        where: { questionId: question.id }
      });
      await prisma.question.delete({
        where: { id: question.id }
      });
      await prisma.user.delete({
        where: { id: userWithoutWallet }
      });
    });
  });
});
