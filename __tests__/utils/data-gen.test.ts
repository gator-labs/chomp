import prisma from "@/app/services/prisma";
import { QuestionType, Token } from "@prisma/client";

import { TestDataGenerator } from "../__utils__/data-gen";

const { generateRandomUserId } = TestDataGenerator;

describe("TestDataGenerator", () => {
  // Store IDs for cleanup
  let testIds: {
    deckIds: number[];
    questionIds: number[];
    questionOptionIds: number[];
    userIds: string[];
    stackIds: number[]; // Changed from stackId: number | undefined to stackIds: number[]
  };

  // Reset testIds before each test
  beforeEach(() => {
    testIds = {
      deckIds: [],
      questionIds: [],
      questionOptionIds: [],
      userIds: [],
      stackIds: [], // Initialize as empty array instead of undefined
    };
  });

  // Clean up after each test
  afterEach(async () => {
    await TestDataGenerator.cleanup(testIds);
  });

  it("should create a stack", async () => {
    const stackId = await TestDataGenerator.createStack({
      name: "Test Stack",
      isActive: true,
      image: "test-image.jpg",
    });

    expect(stackId).toBeDefined();
    expect(typeof stackId).toBe("number");

    // Store for cleanup
    testIds.stackIds.push(stackId); // Push to array instead of direct assignment

    // Verify stack was created
    const stack = await prisma.stack.findUnique({
      where: { id: stackId },
    });
    expect(stack).toBeDefined();
    expect(stack?.name).toBe("Test Stack");
  });

  it("should create users", async () => {
    const userIds = await TestDataGenerator.createUsers([
      {
        id: "test-user-1",
        firstName: "Test",
        lastName: "User 1",
      },
      {
        id: "test-user-2",
        firstName: "Test",
        lastName: "User 2",
      },
    ]);

    expect(userIds).toHaveLength(2);
    expect(userIds).toContain("test-user-1");
    expect(userIds).toContain("test-user-2");

    // Store for cleanup
    testIds.userIds = userIds;

    // Verify users were created
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
    });
    expect(users).toHaveLength(2);
  });

  it("should create a deck", async () => {
    // First create a stack for the deck
    const stackId = await TestDataGenerator.createStack({
      name: "Deck Test Stack",
      isActive: true,
      image: "deck-test-stack.jpg",
    });
    testIds.stackIds.push(stackId); // Push to array instead of direct assignment

    const deckId = await TestDataGenerator.createDeck(
      {
        deck: "Test Deck",
        imageUrl: "test-deck.jpg",
      },
      stackId,
    );

    expect(deckId).toBeDefined();
    expect(typeof deckId).toBe("number");

    // Store for cleanup
    testIds.deckIds.push(deckId);

    // Verify deck was created
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: { stack: true },
    });
    expect(deck).toBeDefined();
    expect(deck?.deck).toBe("Test Deck");
    expect(deck?.stackId).toBe(stackId);
  });

  it("should create questions with options", async () => {
    const questionIds = await TestDataGenerator.createQuestionsWithOptions([
      {
        question: "Test Question 1",
        type: QuestionType.MultiChoice,
        revealToken: Token.Bonk,
        options: [
          { option: "Option 1", isCorrect: true },
          { option: "Option 2", isCorrect: false },
        ],
      },
    ]);

    expect(questionIds).toHaveLength(1);
    expect(typeof questionIds[0]).toBe("number");

    // Store for cleanup
    testIds.questionIds.push(...questionIds);

    // Get and store question option IDs for cleanup
    const questionOptions = await prisma.questionOption.findMany({
      where: { questionId: { in: questionIds } },
    });
    testIds.questionOptionIds = questionOptions.map((qo) => qo.id);

    // Verify question was created with options
    const question = await prisma.question.findUnique({
      where: { id: questionIds[0] },
      include: { questionOptions: true },
    });
    expect(question).toBeDefined();
    expect(question?.question).toBe("Test Question 1");
    expect(question?.questionOptions).toHaveLength(2);
    expect(question?.questionOptions[0].option).toBe("Option 1");
    expect(question?.questionOptions[0].isCorrect).toBe(true);
  });

  it("should associate questions with a deck", async () => {
    // First create a stack
    const stackId = await TestDataGenerator.createStack({
      name: "Association Test Stack",
      isActive: true,
      image: "association-test-stack.jpg",
    });
    testIds.stackIds.push(stackId); // Push to array instead of direct assignment

    // Create a deck
    const deckId = await TestDataGenerator.createDeck(
      {
        deck: "Association Test Deck",
        imageUrl: "association-test-deck.jpg",
      },
      stackId,
    );
    testIds.deckIds.push(deckId);

    // Create questions with options
    const questionIds = await TestDataGenerator.createQuestionsWithOptions([
      {
        question: "Association Test Question",
        type: QuestionType.MultiChoice,
        revealToken: Token.Bonk,
        options: [
          { option: "Association Option 1", isCorrect: true },
          { option: "Association Option 2", isCorrect: false },
        ],
      },
    ]);
    testIds.questionIds.push(...questionIds);

    // Get and store question option IDs for cleanup
    const questionOptions = await prisma.questionOption.findMany({
      where: { questionId: { in: questionIds } },
    });
    testIds.questionOptionIds = questionOptions.map((qo) => qo.id);

    // Associate questions with deck
    await TestDataGenerator.associateQuestionsWithDeck(deckId, questionIds);

    // Verify association
    const deckQuestions = await prisma.deckQuestion.findMany({
      where: {
        deckId: deckId,
        questionId: { in: questionIds },
      },
    });
    expect(deckQuestions).toHaveLength(questionIds.length);
  });

  it("should create answers for questions", async () => {
    // First create users
    const userIds = await TestDataGenerator.createUsers([
      {
        id: "answer-test-user",
        firstName: "Answer",
        lastName: "Test User",
      },
    ]);
    testIds.userIds = userIds;

    // Create questions with options
    const questionIds = await TestDataGenerator.createQuestionsWithOptions([
      {
        question: "Answer Test Question",
        type: QuestionType.MultiChoice,
        revealToken: Token.Bonk,
        options: [
          { option: "Answer Option 1", isCorrect: true },
          { option: "Answer Option 2", isCorrect: false },
        ],
      },
    ]);
    testIds.questionIds.push(...questionIds);

    // Get question option IDs
    const questionOptions = await prisma.questionOption.findMany({
      where: { questionId: { in: questionIds } },
    });
    testIds.questionOptionIds = questionOptions.map((qo) => qo.id);

    // Create answers
    await TestDataGenerator.createAnswers([
      {
        questionOptionId: questionOptions[0].id,
        userId: userIds[0],
        selected: true,
      },
    ]);

    // Verify answer was created
    const answer = await prisma.questionAnswer.findFirst({
      where: {
        questionOptionId: questionOptions[0].id,
        userId: userIds[0],
      },
    });
    expect(answer).toBeDefined();
    expect(answer?.selected).toBe(true);
  });

  it("should create decks with questions with options with answers", async () => {
    // First create users
    const userIds = await TestDataGenerator.createUsers([
      {
        id: "complex-test-user-1",
        firstName: "Complex",
        lastName: "Test User 1",
      },
      {
        id: "complex-test-user-2",
        firstName: "Complex",
        lastName: "Test User 2",
      },
    ]);
    testIds.userIds = userIds;

    // Create a stack
    const stackId = await TestDataGenerator.createStack({
      name: "Complex Test Stack",
      isActive: true,
      image: "complex-test-stack.jpg",
    });
    testIds.stackIds.push(stackId); // Push to array instead of direct assignment

    // Create complex structure
    const result =
      await TestDataGenerator.createDecksWithQuestionsWithOptionsWithAnswers(
        [
          {
            deck: {
              deck: "Complex Test Deck",
              imageUrl: "complex-test-deck.jpg",
            },
            questions: [
              {
                question: "Complex Test Question 1",
                type: QuestionType.MultiChoice,
                revealToken: Token.Bonk,
                options: [
                  {
                    option: "Complex Option 1",
                    isCorrect: true,
                    answers: [
                      {
                        userId: userIds[0],
                        selected: true,
                      },
                    ],
                  },
                  {
                    option: "Complex Option 2",
                    isCorrect: false,
                    answers: [
                      {
                        userId: userIds[1],
                        selected: true,
                        percentage: 100,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        stackId,
      );

    expect(result).toBeDefined();
    expect(result.deckIds).toHaveLength(1);
    expect(result.questionIds).toHaveLength(1);
    expect(result.questionOptionIds).toHaveLength(2);

    // Store for cleanup
    testIds.deckIds.push(...result.deckIds);
    testIds.questionIds.push(...result.questionIds);
    testIds.questionOptionIds.push(...result.questionOptionIds);

    // Verify deck was created
    const deck = await prisma.deck.findUnique({
      where: { id: result.deckIds[0] },
    });
    expect(deck).toBeDefined();
    expect(deck?.deck).toBe("Complex Test Deck");

    // Verify question was created
    const question = await prisma.question.findUnique({
      where: { id: result.questionIds[0] },
      include: { questionOptions: true },
    });
    expect(question).toBeDefined();
    expect(question?.question).toBe("Complex Test Question 1");
    expect(question?.questionOptions).toHaveLength(2);

    // Verify answers were created
    const answers = await prisma.questionAnswer.findMany({
      where: {
        questionOption: {
          questionId: result.questionIds[0],
        },
      },
      include: {
        questionOption: true,
      },
    });
    expect(answers).toHaveLength(2);

    // Check first answer
    const answer1 = answers.find((a) => a.userId === userIds[0]);
    expect(answer1).toBeDefined();
    expect(answer1?.selected).toBe(true);
    expect(answer1?.questionOption.option).toBe("Complex Option 1");

    // Check second answer
    const answer2 = answers.find((a) => a.userId === userIds[1]);
    expect(answer2).toBeDefined();
    expect(answer2?.selected).toBe(true);
    expect(answer2?.percentage).toBe(100);
    expect(answer2?.questionOption.option).toBe("Complex Option 2");
  });

  it("should create a complete test scenario", async () => {
    const userId = `scenario-user-${Math.floor(Math.random() * 1000000)}`;
    const result = await TestDataGenerator.createTestScenario({
      users: [
        {
          id: userId,
          firstName: "Scenario",
          lastName: "User 1",
        },
      ],
      stack: {
        name: "Scenario Stack",
        isActive: true,
        image: "scenario-stack.jpg",
      },
      decks: [
        {
          deck: {
            deck: "Scenario Deck",
            imageUrl: "scenario-deck.jpg",
          },
          questions: [
            {
              question: "Scenario Question 1",
              type: QuestionType.MultiChoice,
              revealToken: Token.Bonk,
              options: [
                {
                  option: "Scenario Option 1",
                  isCorrect: true,
                  answers: [
                    {
                      userId: userId,
                      selected: true,
                    },
                  ],
                },
                {
                  option: "Scenario Option 2",
                  isCorrect: false,
                },
              ],
            },
          ],
        },
      ],
    });

    expect(result).toBeDefined();
    expect(result.deckIds).toHaveLength(1);
    expect(result.questionIds).toHaveLength(1);
    expect(result.questionOptionIds).toHaveLength(2);
    expect(result.userIds).toHaveLength(1);
    expect(result.stackIds[0]).toBeDefined();

    // Store for cleanup
    testIds.deckIds.push(...result.deckIds);
    testIds.questionIds.push(...result.questionIds);
    testIds.questionOptionIds.push(...result.questionOptionIds);
    testIds.userIds.push(...result.userIds);
    if (result.stackIds) testIds.stackIds.push(...result.stackIds); // Push to array instead of direct assignment

    // Verify user was created
    const user = await prisma.user.findUnique({
      where: { id: result.userIds[0] },
    });
    expect(user).toBeDefined();
    expect(user?.firstName).toBe("Scenario");

    // Verify stack was created
    const stack = await prisma.stack.findUnique({
      where: { id: result.stackIds[0] },
    });
    expect(stack).toBeDefined();
    expect(stack?.name).toBe("Scenario Stack");

    // Verify deck was created
    const deck = await prisma.deck.findUnique({
      where: { id: result.deckIds[0] },
    });
    expect(deck).toBeDefined();
    expect(deck?.deck).toBe("Scenario Deck");

    // Verify question was created
    const question = await prisma.question.findUnique({
      where: { id: result.questionIds[0] },
      include: { questionOptions: true },
    });
    expect(question).toBeDefined();
    expect(question?.question).toBe("Scenario Question 1");
    expect(question?.questionOptions).toHaveLength(2);

    // Verify answer was created
    const answer = await prisma.questionAnswer.findFirst({
      where: {
        userId: result.userIds[0],
        questionOption: {
          questionId: result.questionIds[0],
        },
      },
      include: {
        questionOption: true,
      },
    });
    expect(answer).toBeDefined();
    expect(answer?.selected).toBe(true);
    expect(answer?.questionOption.option).toBe("Scenario Option 1");
  });

  it.only("should correctly link answers to question options in nested queries", async () => {
    // Create a test scenario with a stack, deck, question, options, and answers
    const userId = generateRandomUserId();
    const result = await TestDataGenerator.createTestScenario({
      stack: {
        name: "Scenario Stack",
        isActive: true,
        image: "scenario-stack.jpg",
      },
      users: [
        {
          id: userId,
          firstName: "Query",
          lastName: "Test User",
        },
      ],
      decks: [
        {
          deck: {
            deck: "Query Test Deck",
            imageUrl: "query-test-deck.jpg",
          },
          questions: [
            {
              question: "Query Test Question",
              type: QuestionType.MultiChoice,
              revealToken: Token.Bonk,
              options: [
                {
                  option: "Query Option 1",
                  isCorrect: true,
                  answers: [
                    {
                      userId: userId,
                      selected: true,
                    },
                  ],
                },
                {
                  option: "Query Option 2",
                  isCorrect: false,
                },
              ],
            },
          ],
        },
      ],
    });

    // Store for cleanup
    testIds.deckIds.push(...result.deckIds);
    testIds.questionIds.push(...result.questionIds);
    testIds.questionOptionIds.push(...result.questionOptionIds);
    testIds.userIds.push(...result.userIds);
    if (result.stackIds) testIds.stackIds.push(...result.stackIds);

    // Perform a nested query similar to what would be used in the application
    console.log("looking for stack", userId);
    const stack = await prisma.stack.findUnique({
      where: {
        id: result.stackIds[0],
      },
      include: {
        deck: {
          include: {
            deckQuestions: {
              include: {
                question: {
                  include: {
                    questionOptions: {
                      include: {
                        questionAnswers: {
                          where: {
                            userId: userId,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Verify the deck question association exists
    expect(stack?.deck[0].deckQuestions).toHaveLength(1);

    // Verify the question exists
    const question = stack?.deck[0].deckQuestions[0].question;
    expect(question).toBeDefined();
    expect(question?.question).toBe("Query Test Question");

    // Verify the question options exist
    expect(question?.questionOptions).toHaveLength(2);

    // Find the option with the answer
    const optionWithAnswer = question?.questionOptions.find(
      (option) => option.option === "Query Option 1",
    );
    expect(optionWithAnswer).toBeDefined();

    // Verify the answer is correctly linked to the question option
    expect(optionWithAnswer?.questionAnswers).toHaveLength(1);
    expect(optionWithAnswer?.questionAnswers[0].userId).toBe(userId);
    expect(optionWithAnswer?.questionAnswers[0].selected).toBe(true);

    // Verify the other option has no answers
    const optionWithoutAnswer = question?.questionOptions.find(
      (option) => option.option === "Query Option 2",
    );
    expect(optionWithoutAnswer).toBeDefined();
    expect(optionWithoutAnswer?.questionAnswers).toHaveLength(0);

    // Test with a non-existent user ID to ensure no answers are returned
    const stackWithNonExistentUser = await prisma.stack.findUnique({
      where: {
        id: result.stackIds[0],
      },
      include: {
        deck: {
          include: {
            deckQuestions: {
              include: {
                question: {
                  include: {
                    questionOptions: {
                      include: {
                        questionAnswers: {
                          where: {
                            userId: "00000000-0000-0000-0000-000000000000",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Verify no answers are returned for non-existent user
    const questionWithNonExistentUser =
      stackWithNonExistentUser?.deck[0].deckQuestions[0].question;
    expect(
      questionWithNonExistentUser?.questionOptions[0].questionAnswers,
    ).toHaveLength(0);
    expect(
      questionWithNonExistentUser?.questionOptions[1].questionAnswers,
    ).toHaveLength(0);
  });

  it("should clean up test data", async () => {
    // First create some test data to clean up
    const stackId = await TestDataGenerator.createStack({
      name: "Cleanup Test Stack",
      isActive: true,
      image: "cleanup-test-stack.jpg",
    });
    testIds.stackIds.push(stackId); // Push to array instead of direct assignment

    const deckId = await TestDataGenerator.createDeck(
      {
        deck: "Cleanup Test Deck",
        imageUrl: "cleanup-test-deck.jpg",
      },
      stackId,
    );
    testIds.deckIds.push(deckId);

    const questionIds = await TestDataGenerator.createQuestionsWithOptions([
      {
        question: "Cleanup Test Question",
        type: QuestionType.MultiChoice,
        revealToken: Token.Bonk,
        options: [
          { option: "Cleanup Option 1", isCorrect: true },
          { option: "Cleanup Option 2", isCorrect: false },
        ],
      },
    ]);
    testIds.questionIds.push(...questionIds);

    // Get question option IDs
    const questionOptions = await prisma.questionOption.findMany({
      where: { questionId: { in: questionIds } },
    });
    testIds.questionOptionIds = questionOptions.map((qo) => qo.id);

    // Associate questions with deck
    await TestDataGenerator.associateQuestionsWithDeck(deckId, questionIds);

    // Create users
    const userIds = await TestDataGenerator.createUsers([
      {
        id: "cleanup-test-user",
        firstName: "Cleanup",
        lastName: "Test User",
      },
    ]);
    testIds.userIds = userIds;

    // Create answers
    await TestDataGenerator.createAnswers([
      {
        questionOptionId: questionOptions[0].id,
        userId: userIds[0],
        selected: true,
      },
    ]);

    // Verify data exists
    const decks = await prisma.deck.findMany({
      where: { id: { in: testIds.deckIds } },
    });
    expect(decks.length).toBeGreaterThan(0);

    const questions = await prisma.question.findMany({
      where: { id: { in: testIds.questionIds } },
    });
    expect(questions.length).toBeGreaterThan(0);

    const users = await prisma.user.findMany({
      where: { id: { in: testIds.userIds } },
    });
    expect(users.length).toBeGreaterThan(0);

    // Clean up
    await TestDataGenerator.cleanup(testIds);

    // Verify data was cleaned up
    const decksAfter = await prisma.deck.findMany({
      where: { id: { in: testIds.deckIds } },
    });
    expect(decksAfter).toHaveLength(0);

    const questionsAfter = await prisma.question.findMany({
      where: { id: { in: testIds.questionIds } },
    });
    expect(questionsAfter).toHaveLength(0);

    const usersAfter = await prisma.user.findMany({
      where: { id: { in: testIds.userIds } },
    });
    expect(usersAfter).toHaveLength(0);

    if (testIds.stackIds.length > 0) {
      const stackAfter = await prisma.stack.findUnique({
        where: { id: testIds.stackIds[0] },
      });
      expect(stackAfter).toBeNull();
    }
  });

  it("should handle getTomorrow utility function", () => {
    const tomorrow = TestDataGenerator.getTomorrow();

    // Create a date for comparison
    const expectedTomorrow = new Date();
    expectedTomorrow.setUTCDate(expectedTomorrow.getUTCDate() + 1);
    expectedTomorrow.setUTCHours(12, 0, 0, 0);

    expect(tomorrow.getUTCDate()).toBe(expectedTomorrow.getUTCDate());
    expect(tomorrow.getUTCMonth()).toBe(expectedTomorrow.getUTCMonth());
    expect(tomorrow.getUTCFullYear()).toBe(expectedTomorrow.getUTCFullYear());
    expect(tomorrow.getUTCHours()).toBe(12);
    expect(tomorrow.getUTCMinutes()).toBe(0);
    expect(tomorrow.getUTCSeconds()).toBe(0);
  });
});
