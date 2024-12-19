import { answerQuestion } from "@/app/actions/answer";
import { deleteDeck } from "@/app/actions/deck/deck";
import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}));
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Validate points logs for completing questions and decks", () => {
  const currentDate = new Date();
  let userId: string;
  let deckId: number;
  let deckQuestionId: number;
  beforeAll(async () => {
    // create a new deck
    const deck = await prisma.deck.create({
      data: {
        deck: `deck ${currentDate}`,
        revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        stackId: null,
        deckQuestions: {
          create: {
            question: {
              create: {
                stackId: null,
                question: "Bonkaton question?",
                type: "MultiChoice",
                revealTokenAmount: 10,
                revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                durationMiliseconds: BigInt(60000),
                questionOptions: {
                  create: [
                    {
                      option: "A",
                      isCorrect: true,
                      isLeft: false,
                    },
                    {
                      option: "B",
                      isCorrect: false,
                      isLeft: false,
                    },
                    {
                      option: "C",
                      isCorrect: false,
                      isLeft: false,
                    },
                    {
                      option: "D",
                      isCorrect: false,
                      isLeft: false,
                    },
                  ],
                },
              },
            },
          },
        },
      },
      include: {
        deckQuestions: true,
      },
    });
    deckId = deck.id;
    deckQuestionId = deck.deckQuestions[0].questionId; // Fix: use the actual question ID
    // create a new user
    const user = await generateUsers(1);
    userId = user[0].id;
    await prisma.user.createMany({
      data: user,
    });
  });

  // delete all the dummy data after test completion
  afterAll(async () => {
    await deleteDeck(deckId);

    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: {
        userId: userId,
      },
    });

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  });

  it("should allow a user to answer a question once", async () => {
    //find question options
    const questionOptions = await prisma.questionOption.findMany({
      where: {
        question: {
          deckQuestions: {
            some: {
              deckId,
            },
          },
        },
      },
    });

    // Mock the return value of getJwtPayload to simulate the user context
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: userId,
    });

    await answerQuestion({
      questionId: deckQuestionId,
      questionOptionId: questionOptions[1].id,
      percentageGiven: 50,
      percentageGivenForAnswerId: questionOptions[1].id,
      timeToAnswerInMiliseconds: 3638,
      deckId: deckId,
    });

    const questionAnswer = await prisma.questionAnswer.findMany({
      where: {
        userId: userId,
        questionOption: {
          questionId: deckQuestionId,
        },
      },
    });
    expect(questionAnswer).toHaveLength(4); // We expect 4 answers because we created 4 options
  });

  it("should not allow a user to answer the same question twice", async () => {
    //find question options
    const questionOptions = await prisma.questionOption.findMany({
      where: {
        question: {
          deckQuestions: {
            some: {
              deckId,
            },
          },
        },
      },
    });

    // Mock the return value of getJwtPayload to simulate the user context
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: userId,
    });

    try {
      await answerQuestion({
        questionId: deckQuestionId,
        questionOptionId: questionOptions[1].id,
        percentageGiven: 50,
        percentageGivenForAnswerId: questionOptions[1].id,
        timeToAnswerInMiliseconds: 3638,
        deckId: deckId,
      });
    } catch (error: any) {
      expect(error.message).toBe(
        `User with id: ${userId} has already answered question with id: ${deckQuestionId}`,
      );
    }
  });

  it("Records points correctly for deck and question completion", async () => {
    const res = await prisma.fungibleAssetTransactionLog.findMany({
      where: {
        userId: userId,
        OR: [{ type: "AnswerQuestion" }, { type: "AnswerDeck" }],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const answerQuestion = res.find((entry) => entry.type === "AnswerQuestion");
    expect(answerQuestion?.type).toBe("AnswerQuestion");
    expect(Number(answerQuestion?.change)).toBe(10);

    const answerDeck = res.find((entry) => entry.type === "AnswerDeck");
    expect(answerDeck?.type).toBe("AnswerDeck");
    expect(Number(answerDeck?.change)).toBe(20);
  });

  it("should rollback points on transaction failure", async () => {
    // Mock the return value of getJwtPayload to simulate the user context
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: userId,
    });

    const questionOptions = await prisma.questionOption.findMany({
      where: {
        question: {
          deckQuestions: {
            some: {
              deckId,
            },
          },
        },
      },
    });

    const invalidDeckId = 99999;
    try {
      await answerQuestion({
        questionId: deckQuestionId,
        questionOptionId: questionOptions[0].id,
        percentageGiven: 50,
        deckId: invalidDeckId,
        timeToAnswerInMiliseconds: 3638,
      });
      fail("Expected answerQuestion to throw an error");
    } catch {
      const pointLogs = await prisma.fungibleAssetTransactionLog.findMany({
        where: {
          userId,
          questionId: deckQuestionId,
        },
      });
      expect(pointLogs).toHaveLength(0);
    }
  });

  it("should handle concurrent answer submissions correctly", async () => {
    // Mock the return value of getJwtPayload to simulate the user context
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: userId,
    });

    const questionOptions = await prisma.questionOption.findMany({
      where: {
        question: {
          deckQuestions: {
            some: {
              deckId,
            },
          },
        },
      },
    });

    // Create multiple identical submissions to simulate concurrent requests
    const submissions = Array(3).fill({
      questionId: deckQuestionId,
      questionOptionId: questionOptions[0].id,
      percentageGiven: 50,
      deckId,
      timeToAnswerInMiliseconds: 3638,
    });

    // Attempt concurrent submissions and expect failure after first success
    await expect(
      Promise.all(submissions.map((s) => answerQuestion(s))),
    ).rejects.toThrow(/User.*has already answered question/);

    // Verify only one point log entry was created
    const pointLogs = await prisma.fungibleAssetTransactionLog.findMany({
      where: {
        userId,
        questionId: deckQuestionId,
        type: "AnswerQuestion",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    expect(pointLogs).toHaveLength(1);
  });

  it("should handle invalid inputs without awarding points", async () => {
    // Mock the return value of getJwtPayload to simulate the user context
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: userId,
    });

    // Get valid question options first for comparison
    const questionOptions = await prisma.questionOption.findMany({
      where: {
        question: {
          deckQuestions: {
            some: {
              deckId,
            },
          },
        },
      },
    });

    // Test invalid questionOptionId
    await expect(
      answerQuestion({
        questionId: deckQuestionId,
        questionOptionId: 99999,
        percentageGiven: 50,
        deckId: deckId,
        timeToAnswerInMiliseconds: 3638,
      }),
    ).rejects.toThrow("Question option not found");

    // Test invalid percentageGiven
    await expect(
      answerQuestion({
        questionId: deckQuestionId,
        questionOptionId: questionOptions[0].id,
        percentageGiven: -1,
        deckId: deckId,
        timeToAnswerInMiliseconds: 3638,
      }),
    ).rejects.toThrow("Invalid percentage");

    // Verify no points were awarded
    const pointLogs = await prisma.fungibleAssetTransactionLog.findMany({
      where: {
        userId: userId,
        questionId: deckQuestionId,
        type: "AnswerQuestion",
      },
    });
    expect(pointLogs).toHaveLength(0);
  });

  it("should not award deck points for partial completion", async () => {
    // Mock the return value of getJwtPayload to simulate the user context
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: userId,
    });

    // Create a new deck with multiple questions
    const multiQuestionDeck = await prisma.deck.create({
      data: {
        deck: `deck ${new Date()}`,
        revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        stackId: null,
        deckQuestions: {
          create: [
            {
              questionId: await prisma.question
                .create({
                  data: {
                    stackId: null,
                    question: "First question?",
                    type: "MultiChoice",
                    revealTokenAmount: 10,
                    revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    durationMiliseconds: BigInt(60000),
                    questionOptions: {
                      create: [
                        { option: "A", isCorrect: true, isLeft: false },
                        { option: "B", isCorrect: false, isLeft: false },
                      ],
                    },
                  },
                })
                .then((q) => q.id),
            },
            {
              questionId: await prisma.question
                .create({
                  data: {
                    stackId: null,
                    question: "Second question?",
                    type: "MultiChoice",
                    revealTokenAmount: 10,
                    revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    durationMiliseconds: BigInt(60000),
                    questionOptions: {
                      create: [
                        { option: "A", isCorrect: true, isLeft: false },
                        { option: "B", isCorrect: false, isLeft: false },
                      ],
                    },
                  },
                })
                .then((q) => q.id),
            },
          ],
        },
      },
      include: {
        deckQuestions: {
          include: {
            question: {
              include: {
                questionOptions: true,
              },
            },
          },
        },
      },
    });

    // Answer only the first question
    await answerQuestion({
      questionId: multiQuestionDeck.deckQuestions[0].question.id,
      questionOptionId:
        multiQuestionDeck.deckQuestions[0].question.questionOptions[0].id,
      percentageGiven: 50,
      deckId: multiQuestionDeck.id,
      timeToAnswerInMiliseconds: 3638,
    });

    // Verify no deck completion points were awarded
    const deckPoints = await prisma.fungibleAssetTransactionLog.findFirst({
      where: {
        userId: userId,
        deckId: multiQuestionDeck.id,
        type: "AnswerDeck",
      },
    });
    expect(deckPoints).toBeNull();

    // Clean up
    await deleteDeck(multiQuestionDeck.id);
  });
});
