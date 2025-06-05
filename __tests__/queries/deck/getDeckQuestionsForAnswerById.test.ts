import { getDeckQuestionsForAnswerById } from "@/app/queries/deck";
import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { isAfter, isBefore } from "date-fns";
import {
  QuestionType,
  Token,
} from "@prisma/client";
import { ESpecialStack } from "@prisma/client";

import {
  TestDataGenerator,
  TestScenarioResult,
} from "../../__utils__/data-gen";

// Mock external dependencies that are not the DB
jest.mock("@/app/actions/jwt");
jest.mock("date-fns", () => ({
  ...jest.requireActual("date-fns"),
  isAfter: jest.fn(),
  isBefore: jest.fn(),
}));

describe("getDeckQuestionsForAnswerById", () => {
  const mockGetJwtPayload = getJwtPayload as jest.Mock;
  const mockIsAfter = isAfter as jest.Mock;
  const mockIsBefore = isBefore as jest.Mock;

  let testData: TestScenarioResult;
  let communityAskTestData: TestScenarioResult;
  let user1Id: string;
  let user2Id: string;
  let user3Id: string;
  let communityUser1Id: string;
  let communityUser2Id: string;
  let communityUser3Id: string;
  let origCommunityStack: { id: number } | null;
  let origCommunityDecks: { id: number }[];

  beforeAll(async () => {
    user1Id = TestDataGenerator.generateRandomUserId();
    user2Id = TestDataGenerator.generateRandomUserId();
    user3Id = TestDataGenerator.generateRandomUserId();
    
    // Use different user IDs for community ask scenario
    communityUser1Id = TestDataGenerator.generateRandomUserId();
    communityUser2Id = TestDataGenerator.generateRandomUserId();
    communityUser3Id = TestDataGenerator.generateRandomUserId();

    // Check if CommunityAsk stack already exists
    origCommunityStack = await prisma.stack.findUnique({
      where: { specialId: ESpecialStack.CommunityAsk },
    });

    origCommunityDecks = await prisma.deck.findMany({
      where: { stack: { specialId: ESpecialStack.CommunityAsk } },
    });

    // Create test data for regular deck (not CommunityAsk) - no stack needed
    testData = await TestDataGenerator.createTestScenario({
      users: [
        { id: user1Id, username: "userTest1" },
        { id: user2Id, username: "userTest2" },
      ],
      decks: [
        {
          deck: {
            deck: "Test Deck for getDeckQuestionsForAnswerById",
            activeFromDate: new Date(),
            revealAtDate: TestDataGenerator.getTomorrow(),
            heading: "Deck Heading",
            description: "Deck Description",
            imageUrl: "deck.png",
            footer: "Deck Footer",
            author: "Deck Author",
            authorImageUrl: "author.png",
          },
          questions: [
            {
              question: "Question 1?",
              type: QuestionType.BinaryQuestion,
              revealToken: Token.Bonk,
              revealTokenAmount: 10,
              revealAtDate: TestDataGenerator.getTomorrow(),
              creditCostPerQuestion: 5,
              durationMiliseconds: 30000,
              options: [
                { option: "Q1Opt1", isLeft: true, isCorrect: true, index: 0 },
                { option: "Q1Opt2", isLeft: false, isCorrect: false, index: 1 },
              ],
            },
            {
              question: "Question 2?",
              type: QuestionType.BinaryQuestion,
              revealToken: Token.Bonk,
              revealTokenAmount: 20,
              revealAtDate: TestDataGenerator.getTomorrow(),
              creditCostPerQuestion: 2,
              durationMiliseconds: 30000,
              options: [
                { option: "Q2Opt1", isLeft: true, isCorrect: true, index: 0 },
                { option: "Q2Opt2", isLeft: false, isCorrect: false, index: 1 },
              ],
            },
          ],
        },
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

  beforeEach(() => {
    mockGetJwtPayload.mockClear();
    mockIsAfter.mockClear();
    mockIsBefore.mockClear();
  });

  it("should return null if JWT payload is missing or has no sub", async () => {
    mockGetJwtPayload.mockResolvedValue(null);
    const result = await getDeckQuestionsForAnswerById(testData.deckIds[0]);
    expect(result).toBeNull();

    mockGetJwtPayload.mockResolvedValue({});
    const result2 = await getDeckQuestionsForAnswerById(testData.deckIds[0]);
    expect(result2).toBeNull();
  });

  it("should return null if deck is not found", async () => {
    mockGetJwtPayload.mockResolvedValue({ sub: user1Id });
    const result = await getDeckQuestionsForAnswerById(-1);
    expect(result).toBeNull();
  });

  it("should return raw questions if deck activeFromDate is in the future", async () => {
    mockGetJwtPayload.mockResolvedValue({ sub: user1Id });
    mockIsAfter.mockReturnValue(true); // activeFromDate > new Date()
    mockIsBefore.mockReturnValue(false);

    const result = await getDeckQuestionsForAnswerById(testData.deckIds[0]);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(testData.deckIds[0]);
    expect(result?.questions?.length).toBe(2);
    expect(result?.deckInfo).toBeUndefined();
    expect(result?.activeFromDate).toBeDefined();
  });

  it("should return empty questions if a question revealAtDate is in the past", async () => {
    mockGetJwtPayload.mockResolvedValue({ sub: user1Id });
    mockIsAfter.mockReturnValue(false);
    mockIsBefore.mockReturnValue(true); // At least one question is revealed

    const result = await getDeckQuestionsForAnswerById(testData.deckIds[0]);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(testData.deckIds[0]);
    expect(result?.questions).toEqual([]);
    expect(result?.deckInfo).toBeDefined();
    expect(result?.deckInfo?.heading).toBe("Deck Heading");
  });

  describe("Default case: active deck with unrevealed questions", () => {
    beforeEach(async () => {
      mockIsAfter.mockReturnValue(false);
      mockIsBefore.mockReturnValue(false);

      // Clean up any existing answers for user1Id
      await prisma.questionAnswer.deleteMany({
        where: {
          userId: user1Id,
          questionOption: {
            question: {
              deckQuestions: {
                some: { deckId: testData.deckIds[0] },
              },
            },
          },
        },
      });
    });

    it("should return mapped questions with correct costs/rewards for unanswered deck", async () => {
      mockGetJwtPayload.mockResolvedValue({ sub: user1Id });

      const result = await getDeckQuestionsForAnswerById(testData.deckIds[0]);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(testData.deckIds[0]);
      expect(result?.questions?.length).toBe(2);
      
      // Check mapped question structure (different from raw deck.deckQuestions)
      expect(result?.questions[0]).toHaveProperty('id');
      expect(result?.questions[0]).toHaveProperty('question');
      expect(result?.questions[0]).toHaveProperty('questionOptions');
      
      // Check costs and rewards (5 + 2 = 7 total cost, 10 + 20 = 30 total reward)
      expect(result?.deckCreditCost).toBe(7);
      expect(result?.deckRewardAmount).toBe(30);
      expect(result?.numberOfUserAnswers).toBe(0);
      expect(result?.deckInfo).toBeDefined();
    });

    it("should exclude answered questions from costs/rewards", async () => {
      mockGetJwtPayload.mockResolvedValue({ sub: user1Id });

      // Create an answer for the first question
      const firstQuestionOption = await prisma.questionOption.findFirst({
        where: {
          question: {
            deckQuestions: { some: { deckId: testData.deckIds[0] } },
          },
          index: 0,
        },
        select: { id: true },
      });

      if (!firstQuestionOption) {
        throw new Error("Could not find question option for test");
      }

      await prisma.questionAnswer.create({
        data: {
          userId: user1Id,
          questionOptionId: firstQuestionOption.id,
          selected: true,
        },
      });

      const result = await getDeckQuestionsForAnswerById(testData.deckIds[0]);

      expect(result).not.toBeNull();
      expect(result?.numberOfUserAnswers).toBe(1);
      
      // Should exclude the first question (cost: 5, reward: 10) from totals
      expect(result?.deckCreditCost).toBe(2); // Only second question cost
      expect(result?.deckRewardAmount).toBe(20); // Only second question reward
    });
  });

  describe("Authors functionality", () => {
    beforeEach(() => {
      mockGetJwtPayload.mockResolvedValue({ sub: user1Id });
      mockIsAfter.mockReturnValue(false);
      mockIsBefore.mockReturnValue(false);
    });

    it("should return empty authors array for regular decks", async () => {
      const result = await getDeckQuestionsForAnswerById(testData.deckIds[0]);

      expect(result).not.toBeNull();
      expect(result?.questions?.length).toBeGreaterThan(0);
      
      // Deck should have authors property as empty array for regular decks
      expect(result).toHaveProperty('authors');
      expect(Array.isArray(result!.authors)).toBe(true);
      expect(result!.authors).toEqual([]);
    });

    it("should return populated authors array at deck level for CommunityAsk decks", async () => {
      const result = await getDeckQuestionsForAnswerById(communityAskTestData.deckIds[0]);

      expect(result).not.toBeNull();
      expect(result?.questions?.length).toBeGreaterThan(0);

      // Deck should have authors property with populated array
      expect(result).toHaveProperty('authors');
      expect(Array.isArray(result!.authors)).toBe(true);
      expect((result!.authors as any[]).length).toBeGreaterThan(0);
    });

    it("should return correct author structure with address, username, and avatarUrl", async () => {
      const result = await getDeckQuestionsForAnswerById(communityAskTestData.deckIds[0]);

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
      const result = await getDeckQuestionsForAnswerById(communityAskTestData.deckIds[0]);

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
      const result = await getDeckQuestionsForAnswerById(communityAskTestData.deckIds[0]);

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
      const result = await getDeckQuestionsForAnswerById(communityAskTestData.deckIds[0]);

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

      const result = await getDeckQuestionsForAnswerById(communityAskTestData.deckIds[0]);

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
