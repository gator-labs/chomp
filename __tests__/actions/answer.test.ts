import { answerQuestion } from "@/app/actions/answer";
import { deleteDeck } from "@/app/actions/deck/deck";
import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";

// mock unrealted implementations
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
  let user: { id: string; username: string }[];
  let deckId: number;
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
    // create a new user
    user = await generateUsers(1);
    await prisma.user.createMany({
      data: user,
    });

    //find question options
    const questionOptions = await prisma.questionOption.findMany({
      where: {
        question: {
          deckQuestions: {
            some: {
              deckId: deck.id,
            },
          },
        },
      },
    });

    // Mock the return value of getJwtPayload to simulate the user context
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: user[0].id,
    });

    // answer question using action
    answerQuestion({
      questionId: deck.deckQuestions[0].id,
      questionOptionId: questionOptions[1].id,
      percentageGiven: 50,
      percentageGivenForAnswerId: questionOptions[1].id,
      timeToAnswerInMiliseconds: 3638,
      deckId: deckId,
    });
  });

  // delete all the dummy data after test completion
  afterAll(async () => {
    await deleteDeck(deckId);

    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: {
        userId: user[0].id,
      },
    });

    await prisma.user.delete({
      where: {
        id: user[0].id,
      },
    });
  });

  test("Records points correctly for deck and question completion", async () => {
    const res = await prisma.fungibleAssetTransactionLog.findMany({
      where: {
        userId: user[0].id,
      },
    });

    const hasAnswerQuestion = res.some(
      (entry) => entry.type === "AnswerQuestion",
    );
    const hasAnswerDeck = res.some((entry) => entry.type === "AnswerDeck");

    expect(hasAnswerQuestion).toBe(true);
    expect(hasAnswerDeck).toBe(true);
  });
});
