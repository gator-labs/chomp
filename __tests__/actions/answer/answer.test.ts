import { answerQuestion } from "@/actions/answers/answerQuestion";
import { markQuestionAsSeenButNotAnswered } from "@/actions/answers/markQuestionAsSeenButNotAnswered";
import { deleteDeck } from "@/app/actions/deck/deck";
import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { authGuard } from "@/app/utils/auth";
import { getPointBalance } from "@/lib/points/getPointBalance";
import { generateUsers } from "@/scripts/utils";
import { AnswerStatus } from "@prisma/client";

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

    await prisma.userBalance.deleteMany({
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
    (authGuard as jest.Mock).mockResolvedValue({ sub: userId });

    const answerData = questionOptions.map((qo) => ({
      questionOptionId: qo.id,
      userId,
      status: AnswerStatus.Viewed,
      selected: false,
    }));

    await prisma.questionAnswer.createMany({
      data: answerData,
    });

    await expect(
      answerQuestion({
        questionId: deckQuestionId,
        questionOptionId: questionOptions[1].id,
        percentageGiven: 50,
        percentageGivenForAnswerId: questionOptions[1].id,
        timeToAnswerInMiliseconds: 3638,
        deckId: deckId,
      }),
    ).rejects.toThrowError(
      `User with id: ${userId} second order respose doesn't match the give random option id for question id ${deckQuestionId}.`,
    );
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
    (authGuard as jest.Mock).mockResolvedValue({ sub: userId });

    await prisma.questionAnswer.deleteMany({ where: { userId } });

    const seenQuestion = await markQuestionAsSeenButNotAnswered(deckQuestionId);

    randomRes = seenQuestion?.random;

    expect(seenQuestion?.hasError).toBeFalsy();
    expect(randomRes).toBeDefined();

    const authorPointsBalanceBefore = await getPointBalance(authorId);

    await answerQuestion({
      questionId: deckQuestionId,
      questionOptionId: questionOptions[1].id,
      percentageGiven: 50,
      percentageGivenForAnswerId: questionOptions[randomRes!].id,
      timeToAnswerInMiliseconds: 3638,
      deckId: deckId,
    });

    const authorPointsBalanceAfter = await getPointBalance(authorId);

    expect(process.env.NEXT_PUBLIC_ASK_ANSWERED_POINTS_REWARD).toBeDefined();
    expect(authorPointsBalanceAfter - authorPointsBalanceBefore).toEqual(
      Number(process.env.NEXT_PUBLIC_ASK_ANSWERED_POINTS_REWARD),
    );

    const questionAnswer = await prisma.questionAnswer.findMany({
      where: {
        userId: userId,
        questionOption: {
          questionId: deckQuestionId,
        },
      },
    });

    expect(questionAnswer).toHaveLength(4); // We expect 4 answers because we created 4 options

    for (let i = 0; i < questionAnswer.length; i++) {
      if (i == randomRes) expect(questionAnswer[i].percentage).toBe(50);
      else expect(questionAnswer[i].percentage).toBeNull();
    }

    // Calling again should succeed and return the existing result

    await expect(
      markQuestionAsSeenButNotAnswered(deckQuestionId),
    ).resolves.toEqual(
      expect.objectContaining({ random: seenQuestion?.random }),
    );
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
    (authGuard as jest.Mock).mockResolvedValue({ sub: userId });

    await expect(
      answerQuestion({
        questionId: deckQuestionId,
        questionOptionId: questionOptions[1].id,
        percentageGiven: 50,
        percentageGivenForAnswerId: questionOptions[randomRes!].id,
        timeToAnswerInMiliseconds: 3638,
        deckId: deckId,
      }),
    ).rejects.toThrowError(
      `User with id: ${userId} has already answered question with id: ${deckQuestionId}`,
    );
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
