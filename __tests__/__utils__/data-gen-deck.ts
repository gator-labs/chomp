import prisma from "@/app/services/prisma";
import { Prisma } from "@prisma/client";

/** Test data generation for simpler tests **/

export class TestDataGenerator {
  /**
   * Creates test decks with questions
   */
  static async createDecksWithQuestions(
    decks: Array<{
      deck: Prisma.DeckCreateInput;
      questions: Array<
        Prisma.QuestionCreateInput & {
          options: Prisma.QuestionOptionCreateManyQuestionInput[];
        }
      >;
    }>,
  ): Promise<number[]> {
    const createdDecks = [];

    for (const { deck, questions } of decks) {
      const createdDeck = await prisma.deck.create({
        data: {
          ...deck,
          activeFromDate: deck.activeFromDate ?? new Date(),
          revealAtDate: deck.revealAtDate ?? this.getTomorrow(),
        },
      });

      const createdQuestions = await Promise.all(
        questions.map(async (question) => {
          const { options, ...questionData } = question;
          return prisma.question.create({
            data: {
              ...questionData,
              revealToken: questionData.revealToken ?? "Bonk",
              revealTokenAmount: questionData.revealTokenAmount ?? 5000,
              revealAtDate: questionData.revealAtDate ?? this.getTomorrow(),
              questionOptions: {
                createMany: {
                  data: options.map((opt) => ({
                    ...opt,
                    isLeft: opt.isLeft ?? false,
                    isCorrect: opt.isCorrect ?? false,
                  })),
                },
              },
            },
            include: {
              questionOptions: true,
            },
          });
        }),
      );

      await prisma.deckQuestion.createMany({
        data: createdQuestions.map((question) => ({
          deckId: createdDeck.id,
          questionId: question.id,
        })),
      });

      createdDecks.push(createdDeck.id);
    }

    return createdDecks;
  }

  /**
   * Creates test users
   */
  static async createUsers(users: Prisma.UserCreateInput[]): Promise<string[]> {
    const createdUsers = await Promise.all(
      users.map((user) =>
        prisma.user.create({
          data: {
            ...user,
            isAdmin: user.isAdmin ?? false,
          },
        }),
      ),
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
      data: answers.map((answer) => ({
        ...answer,
        status: answer.status ?? "Submitted",
      })),
    });
  }

  /**
   * Creates a complete test scenario
   */
  static async createTestScenario(config: {
    decks: Array<{
      deck: Prisma.DeckCreateInput;
      questions: Array<
        Prisma.QuestionCreateInput & {
          options: Prisma.QuestionOptionCreateManyQuestionInput[];
        }
      >;
    }>;
    users: Prisma.UserCreateInput[];
    answers: Array<{
      userId: string;
      questionId: number;
      selectedOptionIndex: number;
    }>;
  }): Promise<{
    deckIds: number[];
    questionIds: number[];
    userIds: string[];
  }> {
    // Create decks and questions
    const deckIds = await this.createDecksWithQuestions(config.decks);

    // Get all questions for the created decks
    const questions = await prisma.question.findMany({
      where: {
        deckQuestions: {
          some: {
            deckId: { in: deckIds },
          },
        },
      },
      include: {
        questionOptions: true,
      },
    });

    const questionIds = questions.map((q) => q.id);

    // Create users
    const userIds = await this.createUsers(config.users);

    // Create answers
    const answerData: Prisma.QuestionAnswerCreateManyInput[] = [];
    for (const answerConfig of config.answers) {
      const question = questions.find((q) => q.id === answerConfig.questionId);
      if (!question) continue;

      const questionOption =
        question.questionOptions[answerConfig.selectedOptionIndex];
      if (!questionOption) continue;

      answerData.push({
        questionOptionId: questionOption.id,
        userId: answerConfig.userId,
        selected: true,
      });
    }

    await this.createAnswers(answerData);

    return { deckIds, questionIds, userIds };
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
  static async cleanup(ids: {
    deckIds?: number[];
    questionIds?: number[];
    userIds?: string[];
  }): Promise<void> {
    if (ids.deckIds?.length) {
      await prisma.deckQuestion.deleteMany({
        where: { deckId: { in: ids.deckIds } },
      });
      await prisma.deck.deleteMany({
        where: { id: { in: ids.deckIds } },
      });
    }

    if (ids.questionIds?.length) {
      await prisma.questionAnswer.deleteMany({
        where: {
          questionOption: {
            questionId: { in: ids.questionIds },
          },
        },
      });
      await prisma.questionOption.deleteMany({
        where: { questionId: { in: ids.questionIds } },
      });
      await prisma.question.deleteMany({
        where: { id: { in: ids.questionIds } },
      });
    }

    if (ids.userIds?.length) {
      await prisma.questionAnswer.deleteMany({
        where: { userId: { in: ids.userIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: ids.userIds } },
      });
    }
  }
}
