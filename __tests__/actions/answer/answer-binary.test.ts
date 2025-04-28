import { answerQuestion } from "@/actions/answers/answerQuestion";
import { markQuestionAsSeenButNotAnswered } from "@/actions/answers/markQuestionAsSeenButNotAnswered";
import { deleteDeck } from "@/app/actions/deck/deck";
import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";
import { QuestionType } from "@prisma/client";

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

jest.mock("@/app/utils/auth", () => ({
  authGuard: jest.fn(),
}));

jest.mock("p-retry", () => jest.fn().mockImplementation((fn) => fn()));

describe("answer binary question", () => {
  const currentDate = new Date();
  let userId: string;
  let binaryDeckId: number;
  let binaryQuestionId: number;
  beforeAll(async () => {
    const binaryDeck = await prisma.deck.create({
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
                type: QuestionType.BinaryQuestion,
                revealTokenAmount: 10,
                revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                durationMiliseconds: BigInt(60000),
                questionOptions: {
                  create: [
                    {
                      option: "E",
                      isCorrect: true,
                      isLeft: false,
                      index: 0,
                    },
                    {
                      option: "F",
                      isCorrect: false,
                      isLeft: false,
                      index: 1,
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

    binaryDeckId = binaryDeck.id;
    binaryQuestionId = binaryDeck.deckQuestions[0].questionId;

    // create a new user
    const user = await generateUsers(1);
    userId = user[0].id;
    await prisma.user.createMany({
      data: user,
    });
  });

  // delete all the dummy data after test completion
  afterAll(async () => {
    await deleteDeck(binaryDeckId);

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

  it("should allow a user to answer a binary question without a given random mention", async () => {
    //find question options
    const questionOptions = await prisma.questionOption.findMany({
      where: {
        question: {
          deckQuestions: {
            some: { deckId: binaryDeckId },
          },
        },
      },
    });

    // Mock the return value of getJwtPayload to simulate the user context
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: userId,
    });
    await markQuestionAsSeenButNotAnswered(binaryQuestionId);

    await answerQuestion({
      questionId: binaryQuestionId,
      questionOptionId: questionOptions[1].id,
      percentageGiven: 50,
      percentageGivenForAnswerId: questionOptions[1].id,
      timeToAnswerInMiliseconds: 3638,
      deckId: binaryDeckId,
    });

    const questionAnswer = await prisma.questionAnswer.findMany({
      where: {
        userId: userId,
        questionOption: {
          questionId: binaryQuestionId,
        },
      },
    });
    expect(questionAnswer).toHaveLength(2); // We expect 4 answers because we created 4 options
    expect(questionAnswer[0].percentage).toBeNull();
    expect(questionAnswer[1].percentage).toBe(50);
  });
});
