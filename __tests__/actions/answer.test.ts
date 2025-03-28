import { answerQuestion } from "@/actions/answers/answerQuestion";
import { deleteDeck } from "@/app/actions/deck/deck";
import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";
import { AnswerStatus } from "@prisma/client";

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

  it("should not allow to answer a question if no random option selected", async () => {
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

    const answerData = questionOptions.map((qo) => ({
      questionOptionId: qo.id,
      userId,
      status: AnswerStatus.Viewed,
      selected: false,
    }));

    await prisma.questionAnswer.createMany({
      data: answerData,
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
        `User with id: ${userId} second order respose doesn't match the give random option id for question id ${deckQuestionId}.`,
      );
    }
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
});
