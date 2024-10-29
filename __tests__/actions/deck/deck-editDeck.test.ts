import { editDeck } from "@/app/actions/deck/deck";
import { getDeckSchema } from "@/app/queries/deck";
import { deckSchema } from "@/app/schemas/deck";
import prisma from "@/app/services/prisma";
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
  const currentDate = new Date("2024-09-13 15:09:41.489");
  let currentDeckId: number;
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
    questions: [],
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
    const deckId = currentDeckId;
    await prisma.$transaction(async (tx) => {
      const deckQuestions = await tx.deckQuestion.findMany({
        where: {
          deckId,
        },
        include: {
          question: {
            include: {
              questionOptions: true,
            },
          },
        },
      });

      const questionOptionsIds = deckQuestions.flatMap((q) =>
        q.question.questionOptions.map((qo) => qo.id),
      );
      const questionIds = deckQuestions.map((dq) => dq.questionId);

      await tx.chompResult.deleteMany({
        where: {
          questionId: {
            in: questionIds,
          },
        },
      });

      await tx.questionAnswer.deleteMany({
        where: {
          questionOptionId: {
            in: questionOptionsIds,
          },
        },
      });

      await tx.questionOption.deleteMany({
        where: {
          id: {
            in: questionOptionsIds,
          },
        },
      });

      await tx.deckQuestion.deleteMany({
        where: {
          deckId,
        },
      });

      await tx.userDeck.deleteMany({
        where: {
          deckId,
        },
      });

      await tx.deck.delete({ where: { id: deckId } });

      await tx.question.deleteMany({
        where: {
          id: {
            in: questionIds,
          },
        },
      });
    });
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
  });

  it("should edit deck meta data", async () => {
    mockData = {
      id: currentDeckId,
      ...mockData,
      deck: `updated ${currentDate}`,
      description: "Updated Description",
      footer: "Updated Footer",
    };
    await editDeck(mockData);
    const editedDeck = await getDeckSchema(currentDeckId);

    // Test each field individually
    expect(editedDeck?.deck).toEqual(mockData.deck);
    expect(editedDeck?.description).toEqual(mockData.description);
    expect(editedDeck?.footer).toEqual(mockData.footer);
    expect(editedDeck?.imageUrl).toEqual(mockData.imageUrl);
  });

  it("should successfully add new questions to an existing deck", async () => {
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
    expect(updatedDeck!.deckQuestions[0].question.question).toBe(
      "New Test Question",
    );
    expect(updatedDeck!.deckQuestions[0].question.questionOptions).toHaveLength(
      2,
    );
  });

  it("Should update the previously added binary question to a multichoice question.", async () => {
    const currentDeck = await getDeckSchema(currentDeckId);
    mockData = {
      id: currentDeckId,
      ...mockData,
      questions: [
        {
          id: currentDeck?.questions[0].id,
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
    const updatedDeck = await getDeckSchema(currentDeckId);
    expect(updatedDeck!.questions[0].question).toBe("Updated Question");
    expect(updatedDeck!.questions[0].questionOptions).toHaveLength(4);
    expect(updatedDeck!.questions[0].questionOptions[0].option).toBe(
      "test Option 1",
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

  describe("testing answered deck", () => {
    let questionId: number;
    let optionId1: number;
    let optionId2: number;

    // Add a question to the deck
    beforeAll(async () => {
      mockData = {
        id: currentDeckId,
        ...mockData,
        questions: [
          {
            question: "New Question",
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
      if (editedDeck) {
        questionId = editedDeck?.questions[0]?.id;
        optionId1 = editedDeck?.questions[0].questionOptions[0].id;
        optionId2 = editedDeck?.questions[0].questionOptions[1].id;
      }

      // create a new user
      await prisma.user.create({
        data: user,
      });

      //add answer fo the question
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
            : questionOptions[
                Math.floor(Math.random() * questionOptions.length)
              ].id);

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

    it("should allow editing the deck and question metadata after there is one or more answer", async () => {
      mockData = {
        id: currentDeckId,
        ...mockData,
        deck: "Updated Test Deck",
        description: "Updated Description",
        footer: "Updated Footer",
        questions: [
          {
            id: questionId,
            question: "Updated Question After Answer",
            type: "BinaryQuestion",
            questionOptions: [
              { id: optionId1, option: "1", isCorrect: false, isLeft: true },
              { id: optionId2, option: "2", isCorrect: false, isLeft: false },
            ],
            imageUrl: "",
          },
        ],
      };

      await editDeck(mockData);
      const editedDeck = await getDeckSchema(currentDeckId);

      expect(editedDeck!.questions[0].question).toBe(
        "Updated Question After Answer",
      );
      expect(editedDeck?.deck).toEqual(mockData.deck);
      expect(editedDeck?.description).toEqual(mockData.description);
      expect(editedDeck?.footer).toEqual(mockData.footer);
      expect(editedDeck?.imageUrl).toEqual(mockData.imageUrl);
    });

    it("Should update the previously added binary question to a multichoice question.", async () => {
      mockData = {
        id: currentDeckId,
        ...mockData,
        questions: [
          {
            id: questionId,
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
      const result = await editDeck(mockData);
      expect(result).toEqual({
        errorMessage: "Question type can't be changed if there's an answer.",
      });
    });
  });
});
