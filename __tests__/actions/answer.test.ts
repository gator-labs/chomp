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
    deckQuestionId = deck.id;
    deckId = deck.id;
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

  test("should allow a user to answer a question once", async () => {
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
      },
    });
    expect(questionAnswer).toHaveLength(4);
  });

  test("should not allow a user to answer the same question twice", async () => {
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

  test("Records points correctly for deck and question completion", async () => {
    const res = await prisma.fungibleAssetTransactionLog.findMany({
      where: {
        userId: userId,
      },
    });

    const answerQuestion = res.find((entry) => entry.type === "AnswerQuestion");

    expect(answerQuestion?.type).toBe("AnswerQuestion");
    expect(Number(answerQuestion?.change)).toBe(10);

    const answerDeck = res.find((entry) => entry.type === "AnswerDeck");
    expect(answerDeck?.type).toBe("AnswerDeck");
    expect(Number(answerDeck?.change)).toBe(20);
  });
});
