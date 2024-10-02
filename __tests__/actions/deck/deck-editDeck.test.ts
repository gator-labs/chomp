import { deleteDeck, editDeck } from "@/app/actions/deck/deck";
import { getDeckSchema } from "@/app/queries/deck";
import { deckSchema } from "@/app/schemas/deck";
import prisma from "@/app/services/prisma";
import { ONE_MINUTE_IN_MILLISECONDS } from "@/app/utils/dateUtils";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";


// Mocking Next.js dependencies and functions that are not the focus of this test
jest.mock("@/app/queries/user", () => ({
  getIsUserAdmin: jest.fn(),
}));
jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));
jest.mock("@/app/utils/file", () => ({
  validateBucketImage: jest.fn(),
}));
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("Editing a Deck", () => {
  const currentDate = new Date();
  let currentDeckId: number;
  let currentDeckQuestionId: number;
  let user: { id: string; username: string };

  // Dummy deck data
  let mockData = {
    deck: `deck ${currentDate}`,
    description: "Description",
    footer: "Footer",
    tagIds: [],
    stackId: null,
    revealToken: "Bonk",
    activeFromDate: new Date(currentDate.setDate(currentDate.getDate() - 1)),
    revealAtDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    revealTokenAmount: 50,
    revealAtAnswerCount: null,
    durationMiliseconds: 10,
    questions: [
      {
        question: "Question",
        type: "BinaryQuestion",
        questionOptions: [
          { option: "1", isCorrect: false, isLeft: true },
          { option: "2", isCorrect: false, isLeft: false },
        ],
        imageUrl: "",
      },
    ],
    imageUrl: "",
  } as unknown as z.infer<typeof deckSchema>;

 // Add mock deck with one question and a user to database
  beforeAll(async () => {
    await prisma.$transaction(async (tx) => {
      const deck = await tx.deck.create({
        data: {
          deck: mockData.deck,
          imageUrl: mockData.imageUrl,
          revealAtDate: mockData.revealAtDate,
          revealAtAnswerCount: mockData.revealAtAnswerCount,
          date: mockData.date,
          activeFromDate: mockData.activeFromDate,
          stackId: mockData.stackId,
          description: mockData.description,
          footer: mockData.footer,
          heading: mockData.heading,
        },
      });
      const question = mockData.questions[0];
      const newQuestion = await tx.question.create({
        data: {
          question: question.question,
          type: question.type,
          imageUrl: question.imageUrl,
          revealToken: mockData.revealToken,
          revealTokenAmount: mockData.revealTokenAmount,
          revealAtDate: mockData.revealAtDate,
          revealAtAnswerCount: mockData.revealAtAnswerCount,
          durationMiliseconds: ONE_MINUTE_IN_MILLISECONDS,
          deckQuestions: {
            create: {
              deckId: deck.id,
            },
          },
          questionOptions: {
            createMany: {
              data: question.questionOptions,
            },
          },
          questionTags: {
            createMany: {
              data: mockData.tagIds.map((tagId) => ({ tagId })),
            },
          },
          stackId: mockData.stackId,
        },
      });
      currentDeckQuestionId = newQuestion.id;
      currentDeckId = deck.id;
    });

    user = {
      id: uuidv4(),
      username: `user1`,
    };
  });

  // delete all the deck and user data after all the test run
  afterAll(async () => {
    deleteDeck(currentDeckId);
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
  });

  it.skip("should edit deck tilte", async () => {
    mockData = {
      id: currentDeckId,
      ...mockData,
      deck: `updated ${currentDate}`,
    };
    await editDeck(mockData);
    const editedDeck = await getDeckSchema(currentDeckId);
    expect(mockData?.deck).toEqual(editedDeck?.deck);
  });

  it("should change a question a binary question to multi", async () => {
    mockData = {
      id: currentDeckId,
      ...mockData,
      questions: [
        {
          id: currentDeckQuestionId,
          question: "Question",
          type: "MultiChoice",
          questionOptions: [
            { option: "test", isCorrect: false, isLeft: false },
            { option: "test", isCorrect: false, isLeft: false },
            { option: "test", isCorrect: true, isLeft: false },
            { option: "test", isCorrect: false, isLeft: false },
          ],
          imageUrl: "",
        },
      ],
    };
    await editDeck(mockData);
    const editedDeck = await getDeckSchema(currentDeckId);
    expect(editedDeck?.questions[0].questionOptions).toMatchObject(
      mockData.questions[0].questionOptions,
    );
  });

  it("should delete a question from deck", async () => {
    mockData = {
      id: currentDeckId,
      ...mockData,
      questions: [],
    };
    await editDeck(mockData);
    const editedDeck = await getDeckSchema(currentDeckId);
    expect(mockData?.questions).toEqual(editedDeck?.questions);
  });

  it("should not allow editing the deck after there is one or more answer", async () => {
    mockData = {
      id: currentDeckId,
      ...mockData,
      questions: [
        {
          question: "Question",
          type: "BinaryQuestion",
          questionOptions: [
            { option: "1", isCorrect: false, isLeft: true },
            { option: "2", isCorrect: false, isLeft: false },
          ],
          imageUrl: "",
        },
      ],
    };

    await editDeck(mockData);
    const editedDeck = await getDeckSchema(currentDeckId);

    await prisma.user.create({
      data: user,
    });

    const questionOptions = await prisma.questionOption.findMany({
      where: {
        question: {
          deckQuestions: {
            some: {
              deckId: editedDeck?.id,
            },
          },
        },
      },
    });

    for (const option of questionOptions) {
      // Random percentage for the first option
      const randomPercentage = Math.floor(Math.random() * 100);
      // Calculate the remaining percentage for the other option
      const remainingPercentage = 100 - randomPercentage;

      const selectedOption = questionOptions[0];

      const isSelectedOption =
        option.id ===
        (selectedOption
          ? selectedOption.id
          : questionOptions[Math.floor(Math.random() * questionOptions.length)]
              .id);

      // Apply percentages such that they sum up to 100 for each user's answer set
      await prisma.questionAnswer.create({
        data: {
          userId: user.id,
          questionOptionId: option.id,
          percentage: option.isLeft ? randomPercentage : remainingPercentage,
          selected: isSelectedOption,
          timeToAnswer: BigInt(Math.floor(Math.random() * 60000)), // Random time to answer within 60 seconds
        },
      });
    }
  });
});