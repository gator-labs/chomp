import { editDeck } from "@/app/actions/deck/deck";
import { getDeckSchema } from "@/app/queries/deck";
import { deckSchema } from "@/app/schemas/deck";
import prisma from "@/app/services/prisma";
import { ONE_MINUTE_IN_MILLISECONDS } from "@/app/utils/dateUtils";
import { z } from "zod";

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

  let mockData = {
    deck: `deck ${currentDate}`,
    description: "Description",
    footer: "Footer",
    tagIds: [],
    campaignId: null,
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

  let currentDeckId: number;

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
          campaignId: mockData.campaignId,
          description: mockData.description,
          footer: mockData.footer,
          heading: mockData.heading,
        },
      });
      for (const question of mockData.questions) {
        await tx.question.create({
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
            campaignId: mockData.campaignId,
          },
        });
      }
      currentDeckId = deck.id;
    });
  });

  it("should edit deck tilte", async () => {
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
    const currentDeck = await getDeckSchema(currentDeckId);
    mockData = {
      id: currentDeckId,
      ...mockData,
      questions: [
        {
          id: currentDeck?.questions[0].id,
          question: "Question",
          type: "MultiChoice",
          questionOptions: [
            { option: "1", isCorrect: false, isLeft: false },
            { option: "2", isCorrect: false, isLeft: false },
            { option: "3", isCorrect: true, isLeft: false },
            { option: "4", isCorrect: false, isLeft: false },
          ],
          imageUrl: "",
        },
      ],
    };
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

  // it("should not allow editing the deck after there is one or more answer", async () => {
  //   mockData = {
  //     id: currentDeckId,
  //     ...mockData,
  //     questions: [
  //       {
  //         question: "Question",
  //         type: "MultiChoice",
  //         questionOptions: [
  //           { option: "1", isCorrect: false, isLeft: false },
  //           { option: "2", isCorrect: false, isLeft: false },
  //           { option: "3", isCorrect: true, isLeft: false },
  //           { option: "4", isCorrect: false, isLeft: false },
  //         ],
  //         imageUrl: "",
  //       },
  //     ],
  //   };
  //   await editDeck(mockData);
  //   const deck = await getDeckSchema(currentDeckId);
  //   answerQuestion({
  //     questionId: deck?.questions[0]?.id || 0,
  //     questionOptionId: deck?.questions[0].questionOptions[0].id,
  //     percentageGiven: 70,
  //     percentageGivenForAnswerId: 51,
  //     timeToAnswerInMiliseconds: 4000,
  //     deckId: deck?.id
  //   })
  // });
});
