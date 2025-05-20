import { answerQuestion } from "@/actions/answers/answerQuestion";
import { markQuestionAsSeenButNotAnswered } from "@/actions/answers/markQuestionAsSeenButNotAnswered";
import { deleteDeck } from "@/app/actions/deck/deck";
import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { authGuard } from "@/app/utils/auth";
import { generateUsers } from "@/scripts/utils";

jest.mock("@/app/utils/auth");

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

jest.mock("p-retry", () => jest.fn().mockImplementation((fn) => fn()));

describe("Validate points logs for completing questions and decks", () => {
  const currentDate = new Date();
  let userId: string;
  let authorId: string;
  let deckId: number;
  let deckQuestionId: number;
  let randomRes: number | undefined;
  beforeAll(async () => {
    const users = await generateUsers(2);
    userId = users[0].id;
    authorId = users[1].id;
    await prisma.user.createMany({
      data: users,
    });

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
                isSubmittedByUser: true,
                createdByUserId: authorId,
                type: "MultiChoice",
                revealTokenAmount: 10,
                creditCostPerQuestion: 1,
                revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                durationMiliseconds: BigInt(60000),

                questionOptions: {
                  create: [
                    {
                      option: "A",
                      isCorrect: true,
                      isLeft: false,
                      index: 0,
                    },
                    {
                      option: "B",
                      isCorrect: false,
                      isLeft: false,
                      index: 1,
                    },
                    {
                      option: "C",
                      isCorrect: false,
                      isLeft: false,
                      index: 2,
                    },
                    {
                      option: "D",
                      isCorrect: false,
                      isLeft: false,
                      index: 3,
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
  });

  // delete all the dummy data after test completion
  afterAll(async () => {
    await prisma.askQuestionAnswer.deleteMany({
      where: {
        userId: { in: [userId, authorId] },
      },
    });

    await deleteDeck(deckId);

    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: {
        userId: { in: [userId, authorId] },
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: { in: [userId, authorId] },
      },
    });
  });

  it("should not allow to answer if insufficient credits", async () => {
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
    (authGuard as jest.Mock).mockResolvedValue({ sub: userId });

    await prisma.questionAnswer.deleteMany({ where: { userId } });

    const seenQuestion = await markQuestionAsSeenButNotAnswered(deckQuestionId);

    randomRes = seenQuestion?.random;

    try {
      await answerQuestion({
        questionId: deckQuestionId,
        questionOptionId: questionOptions[1].id,
        percentageGiven: 50,
        percentageGivenForAnswerId: questionOptions[randomRes!].id,
        timeToAnswerInMiliseconds: 3638,
        deckId: deckId,
      });
    } catch (error: any) {
      expect(error?.message).toMatch(
        `User ${userId} has insufficient credits to charge for question ${deckQuestionId}`,
      );
    }
  });
});
