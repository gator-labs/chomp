import prisma from "@/app/services/prisma";
import { Prisma } from "@prisma/client";

/** Test data generation for simpler tests **/

// Extract the return type of createTestScenario
export type TestScenarioResult = {
  deckIds: number[];
  questionIds: number[];
  questionOptionIds: number[];
  userIds: string[];
  stackIds: number[];
};

export class TestDataGenerator {
  /**
   * Generates a random user id with an optional prefix
   * @param prefix Optional prefix for the id
   * @returns A random id
   */
  static generateRandomUserId(prefix: string = "user"): string {
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    return `${prefix}_${randomSuffix}`;
  }

  /**
   * Creates an empty test scenario result object
   * @returns An empty TestScenarioResult object
   */
  static createEmptyTestScenarioResult(): TestScenarioResult {
    return {
      deckIds: [],
      questionIds: [],
      questionOptionIds: [],
      userIds: [],
      stackIds: [],
    };
  }

  /**
   * Creates a test stack
   */
  static async createStack(stack: Prisma.StackCreateInput): Promise<number> {
    // If specialId is provided, try to find an existing stack
    if (stack.specialId) {
      const existingStack = await prisma.stack.findUnique({
        where: { specialId: stack.specialId },
      });
      if (existingStack) {
        return existingStack.id; // Return existing stack's ID
      }
    }
    // If no specialId or not found, create a new stack
    const createdStack = await prisma.stack.create({
      data: stack,
    });
    return createdStack.id;
  }

  /**
   * Creates a test deck
   *
   * @param deck - The deck data to create
   * @param [stackId] - Optional stack ID to associate the deck with
   * @returns The ID of the created deck
   */
  static async createDeck(
    deck: Prisma.DeckCreateInput,
    stackId?: number,
  ): Promise<number> {
    const createdDeck = await prisma.deck.create({
      data: {
        ...deck,
        // Connect to stack if it was provided
        ...(stackId ? { stack: { connect: { id: stackId } } } : {}),
      },
    });

    return createdDeck.id;
  }

  /**
   * Creates test questions with options
   */
  static async createQuestionsWithOptions(
    questions: Array<
      Prisma.QuestionCreateInput & {
        options: Prisma.QuestionOptionCreateManyQuestionInput[];
      }
    >,
  ): Promise<number[]> {
    const createdQuestionIds = [];

    for (const question of questions) {
      const { options, ...questionData } = question;
      const createdQuestion = await prisma.question.create({
        data: {
          ...questionData,
          questionOptions: {
            createMany: {
              data: options,
            },
          },
        },
        include: {
          questionOptions: true,
        },
      });

      createdQuestionIds.push(createdQuestion.id);
    }

    return createdQuestionIds;
  }

  /**
   * Associates questions with a deck
   */
  static async associateQuestionsWithDeck(
    deckId: number,
    questionIds: number[],
  ): Promise<void> {
    await prisma.deckQuestion.createMany({
      data: questionIds.map((questionId) => ({
        deckId,
        questionId,
      })),
    });
  }

  /**
   * Creates test users
   */
  static async createUsers(users: Prisma.UserCreateInput[]): Promise<string[]> {
    const createdUsers = await Promise.all(
      users.map((user) => prisma.user.create({ data: user })),
    );
    return createdUsers.map((u) => u.id);
  }

  /**
   * Creates answers for questions
   */
  static async createAnswers(
    answers: Prisma.QuestionAnswerCreateManyInput[],
  ): Promise<void> {
    await prisma.questionAnswer.createMany({
      data: answers,
    });
  }

  /**
   * Creates test decks with questions with options with answers
   */
  static async createDecksWithQuestionsWithOptionsWithAnswers(
    decks: Array<{
      deck: Prisma.DeckCreateInput;
      questions: Array<
        Prisma.QuestionCreateInput & {
          options: Array<
            Prisma.QuestionOptionCreateManyQuestionInput & {
              answers?: Array<{
                userId: string;
                selected: boolean;
                percentage?: number;
              }>;
            }
          >;
        }
      >;
    }>,
    stackId?: number,
  ): Promise<{
    deckIds: number[];
    questionIds: number[];
    questionOptionIds: number[];
  }> {
    const createdDeckIds: number[] = [];
    const createdQuestionIds: number[] = [];
    const createdQuestionOptionIds: number[] = [];

    // Create decks, its questions and question options
    // associate questions with deck
    for (const { deck, questions } of decks) {
      const deckId = await this.createDeck(deck, stackId);
      createdDeckIds.push(deckId);

      // Create questions with options but track the created question options
      const createdQuestions = [];
      for (const question of questions) {
        const { options, ...questionData } = question;

        // Create the question with its options
        const createdQuestion = await prisma.question.create({
          data: {
            ...questionData,
            questionOptions: {
              createMany: {
                data: options.map(function ({ answers, ...optionData }) {
                  Array.isArray(answers); // Keeping linter happy
                  return optionData;
                }),
              },
            },
          },
          include: {
            questionOptions: true,
          },
        });

        createdQuestionIds.push(createdQuestion.id);
        createdQuestionOptionIds.push(
          ...createdQuestion.questionOptions.map((o) => o.id),
        );

        createdQuestions.push({
          questionId: createdQuestion.id,
          options: createdQuestion.questionOptions.map((option, index) => ({
            optionId: option.id,
            answers: options[index]?.answers || [],
          })),
        });
      }

      // Associate questions with deck
      await this.associateQuestionsWithDeck(
        deckId,
        createdQuestions.map((q) => q.questionId),
      );

      // Create answers for question options if provided
      const answerData: Prisma.QuestionAnswerCreateManyInput[] = [];

      for (const question of createdQuestions) {
        for (const option of question.options) {
          if (option.answers && option.answers.length > 0) {
            for (const answer of option.answers) {
              answerData.push({
                questionOptionId: option.optionId,
                userId: answer.userId,
                selected: answer.selected,
                percentage: answer.percentage,
              });
            }
          }
        }
      }

      // Create all answers in a batch if there are any
      if (answerData.length > 0) {
        await this.createAnswers(answerData);
      }
    }

    return {
      deckIds: createdDeckIds,
      questionIds: createdQuestionIds,
      questionOptionIds: createdQuestionOptionIds,
    };
  }

  /**
   * Creates a complete test scenario
   */
  static async createTestScenario(config: {
    users?: Prisma.UserCreateInput[];

    stack?: Prisma.StackCreateInput;

    decks?: Array<{
      deck: Prisma.DeckCreateInput;
      questions: Array<
        Prisma.QuestionCreateInput & {
          options: Array<
            Prisma.QuestionOptionCreateManyQuestionInput & {
              answers?: Array<{
                userId: string;
                selected: boolean;
                percentage?: number;
              }>;
            }
          >;
        }
      >;
    }>;
  }): Promise<TestScenarioResult> {
    // Create users if provided
    let userIds: string[] = [];
    if (config.users) {
      userIds = await this.createUsers(config.users);
    }

    // Create stack if provided
    let stackId: number | undefined;
    if (config.stack) {
      stackId = await this.createStack(config.stack);
    }

    // Create Deck with Questions with Options with Answers if provided
    let deckIds: number[] = [];
    let questionIds: number[] = [];
    let questionOptionIds: number[] = [];
    //let questions: (Question & { questionOptions: any[] })[] = [];

    if (config.decks) {
      // Create decks and questions
      const result = await this.createDecksWithQuestionsWithOptionsWithAnswers(
        config.decks,
        stackId,
      );
      deckIds = result.deckIds;
      questionIds = result.questionIds;
      questionOptionIds = result.questionOptionIds;

      //// Get all questions for the created decks if any
      //questions = await prisma.question.findMany({
      //  where: {
      //    deckQuestions: {
      //      some: {
      //        deckId: { in: deckIds || [] },
      //      },
      //    },
      //  },
      //  include: {
      //    questionOptions: true,
      //  },
      //});
    }

    return {
      deckIds,
      questionIds,
      questionOptionIds,
      userIds,
      stackIds: stackId ? [stackId] : [],
    };
  }

  /**
   * Helper to get tomorrow's date at noon UTC
   */
  static getTomorrow(): Date {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(12, 0, 0, 0);
    return tomorrow;
  }

  /**
   * Cleans up test data
   * @param ids Object containing IDs to clean up
   */
  static async cleanup(ids?: {
    stackIds?: number[];
    deckIds?: number[];
    questionIds?: number[];
    questionOptionIds?: number[];
    userIds?: string[];
    stackId?: number;
  }): Promise<void> {
    if (!ids) {
      console.warn("TestDataGenerator.cleanup called with undefined ids. Skipping cleanup.");
      return;
    }
    // First, clean up all answers
    const answerWhereClause: any = {};

    if (ids.questionOptionIds?.length) {
      answerWhereClause.questionOptionId = { in: ids.questionOptionIds };
    } else if (ids.questionIds?.length) {
      answerWhereClause.questionOption = {
        questionId: { in: ids.questionIds },
      };
    } else if (ids.userIds?.length) {
      answerWhereClause.userId = { in: ids.userIds };
    }

    if (Object.keys(answerWhereClause).length > 0) {
      await prisma.questionAnswer.deleteMany({
        where: answerWhereClause,
      });
    }

    // Clean up deck-question associations
    const deckQuestionWhereClause: any = {};
    if (ids.deckIds?.length)
      deckQuestionWhereClause.deckId = { in: ids.deckIds };
    if (ids.questionIds?.length)
      deckQuestionWhereClause.questionId = { in: ids.questionIds };

    if (Object.keys(deckQuestionWhereClause).length > 0) {
      await prisma.deckQuestion.deleteMany({
        where: deckQuestionWhereClause,
      });
    }

    // Clean up question options
    if (ids.questionOptionIds?.length) {
      await prisma.questionOption.deleteMany({
        where: { id: { in: ids.questionOptionIds } },
      });
    } else if (ids.questionIds?.length) {
      await prisma.questionOption.deleteMany({
        where: { questionId: { in: ids.questionIds } },
      });
    }

    // Clean up questions
    if (ids.questionIds?.length) {
      await prisma.question.deleteMany({
        where: { id: { in: ids.questionIds } },
      });
    }

    // Clean up decks
    if (ids.deckIds?.length) {
      await prisma.deck.deleteMany({
        where: { id: { in: ids.deckIds } },
      });
    }

    // Clean up users
    if (ids.userIds?.length) {
      await prisma.user.deleteMany({
        where: { id: { in: ids.userIds } },
      });
    }

    // Clean up stacks if provided
    const stackIdsToDelete = [];
    if (ids.stackIds?.length) {
      stackIdsToDelete.push(...ids.stackIds);
    }
    if (ids.stackId) {
      stackIdsToDelete.push(ids.stackId);
    }

    if (stackIdsToDelete.length > 0) {
      await prisma.stack.deleteMany({
        where: { id: { in: stackIdsToDelete } },
      });
    }
  }
}
