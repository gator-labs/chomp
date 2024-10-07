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

  it('should successfully add new questions to an existing deck', async () => {
    mockData = {
      id: currentDeckId,
      ...mockData,
      questions: [
        {
          question: "New Test Question",
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

    const updatedDeck = await prisma.deck.findUnique({
      where: { id: currentDeckId },
      include: {
        deckQuestions: {
          include: {
            question: {
              include: {
                questionOptions: true,
                questionTags: true,
              },
            },
          },
        },
      },
    });

    expect(updatedDeck).toBeTruthy();
    expect(updatedDeck!.deck).toBe(mockData.deck);
    expect(updatedDeck!.deckQuestions).toHaveLength(1);
    expect(updatedDeck!.deckQuestions).toHaveLength(1);
    expect(updatedDeck!.deckQuestions[0].question.question).toBe('New Test Question');
    expect(updatedDeck!.deckQuestions[0].question.questionOptions).toHaveLength(2);
  });

  it("should change a question a binary question to multi with image", async () => {
    mockData = {
      id: currentDeckId,
      ...mockData,
      questions: [
        {
          id: currentDeckQuestionId,
          question: "Updated Question",
          type: "MultiChoice",
          questionOptions: [
            { option: "test Option 1", isCorrect: false, isLeft: false },
            { option: "test Option 2", isCorrect: false, isLeft: false },
            { option: "test Option 3", isCorrect: true, isLeft: false },
            { option: "test Option 4", isCorrect: false, isLeft: false },
          ],
          imageUrl: "",
        },
      ],
    };
    await editDeck(mockData);
    const editedDeck = await getDeckSchema(currentDeckId);
    expect(editedDeck!.questions[0].question).toBe('Updated Question');
    expect(editedDeck!.questions[0].questionOptions).toHaveLength(4);
    expect(editedDeck!.questions[0].questionOptions[0].option).toBe('test Option 1');
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

    const updateData = {
      ...mockData,
      deck: 'Updated Test Deck',
    };

    const result = await editDeck(updateData);

    expect(result).toEqual({ errorMessage: 'Cannot edit deck' });

    const unchangedDeck = await getDeckSchema(currentDeckId);

    expect(unchangedDeck!.deck).toBe(mockData.deck);
  });
});