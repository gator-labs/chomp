import { deleteDeck } from "@/app/actions/deck/deck";
import { getNextDeckId } from "@/app/queries/home";
import prisma from "@/app/services/prisma";
import { authGuard } from "@/app/utils/auth";
import { QuestionType } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

jest.mock("@/app/utils/auth", () => ({
  authGuard: jest.fn(),
}));

jest.mock("p-retry", () => ({
  retry: jest.fn((fn) => fn()),
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

describe("getNextDeckIdQuery", () => {
  const user1 = {
    id: uuidv4(),
    username: `user1`,
  };

  let deckIds: number[] = [];
  let stackId: number;

  beforeAll(async () => {
    // Create users
    await prisma.user.create({ data: user1 });

    const deckData = [
      {
        data: {
          deck: `Free Deck ${new Date().getTime()}`,
          revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          activeFromDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          revealAtAnswerCount: null,
          creditCostPerQuestion: 0,
          deckQuestions: {
            create: {
              question: {
                create: {
                  stackId: null,
                  question: "Question 2",
                  type: QuestionType.BinaryQuestion,
                  revealTokenAmount: 10,
                  revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                  revealAtAnswerCount: null,
                  durationMiliseconds: BigInt(60000),
                  creditCostPerQuestion: 0,
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
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        data: {
          deck: `Free Deck ${new Date().getTime()}`,
          revealAtAnswerCount: null,
          revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          activeFromDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          creditCostPerQuestion: 0,
          deckQuestions: {
            create: {
              question: {
                create: {
                  stackId: null,
                  question: "Question 3",
                  type: QuestionType.BinaryQuestion,
                  revealTokenAmount: 10,
                  revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                  revealAtAnswerCount: null,
                  creditCostPerQuestion: 0,
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
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        data: {
          deck: `Paid Deck ${new Date().getTime()}`,
          revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          revealAtAnswerCount: null,
          activeFromDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          creditCostPerQuestion: 1,
          deckQuestions: {
            create: {
              question: {
                create: {
                  stackId: null,
                  question: "Question 4",
                  type: QuestionType.BinaryQuestion,
                  revealTokenAmount: 10,
                  revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                  revealAtAnswerCount: null,
                  durationMiliseconds: BigInt(60000),
                  creditCostPerQuestion: 1,
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
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        data: {
          deck: `Paid Deck ${new Date().getTime()}`,
          revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          activeFromDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          revealAtAnswerCount: null,
          creditCostPerQuestion: 1,
          deckQuestions: {
            create: {
              question: {
                create: {
                  stackId: null,
                  question: "Question 5",
                  type: QuestionType.BinaryQuestion,
                  revealTokenAmount: 10,
                  revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                  revealAtAnswerCount: null,
                  durationMiliseconds: BigInt(60000),
                  creditCostPerQuestion: 1,
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
                    ],
                  },
                },
              },
            },
          },
        },
      },
    ];

    const decks = [];

    for (let i = 0; i < deckData.length; i++) {
      const deck = await prisma.deck.create(deckData[i]);
      decks.push(deck);
    }

    deckIds = decks.map((deck) => deck.id);
  });

  afterAll(async () => {
    if (stackId) {
      await prisma.stack.deleteMany({
        where: { id: stackId },
      });
    }

    const deletePromises = deckIds.map((deckId) => deleteDeck(deckId));
    await Promise.all(deletePromises);

    await prisma.user.deleteMany({
      where: {
        id: user1.id,
      },
    });
  });

  it("should return a free deck and verify previous deck is free", async () => {
    // Mock the authGuard to resolve with a user ID
    (authGuard as jest.Mock).mockResolvedValue({ sub: user1.id });

    // Get the next deck ID
    const nextDeckId = await getNextDeckId(deckIds[0], null);

    // Fetch the previous deck (the one we're starting from)
    const previousDeck = await prisma.deck.findUnique({
      where: {
        id: deckIds[0],
      },
    });

    // Fetch the next deck
    const nextDeck = await prisma.deck.findUnique({
      where: {
        id: nextDeckId,
      },
    });

    // Assert that both previous and next decks exist
    expect(previousDeck).not.toBeNull();
    expect(nextDeck).not.toBeNull();

    // Check that the credit cost for both decks is zero
    expect(previousDeck?.creditCostPerQuestion).toBe(0);
    expect(nextDeck?.creditCostPerQuestion).toBe(0);
  });

  it("should return a premium deck and verify previous premium is free", async () => {
    // Mock the authGuard to resolve with a user ID
    (authGuard as jest.Mock).mockResolvedValue({ sub: user1.id });

    // Get the next deck ID
    const nextDeckId = await getNextDeckId(deckIds[2], null);

    // Fetch the previous deck (the one we're starting from)
    const previousDeck = await prisma.deck.findUnique({
      where: {
        id: deckIds[2],
      },
    });

    // Fetch the next deck
    const nextDeck = await prisma.deck.findUnique({
      where: {
        id: nextDeckId,
      },
    });

    // Assert that both previous and next decks exist
    expect(previousDeck).not.toBeNull();
    expect(nextDeck).not.toBeNull();

    // Check that the credit cost for both decks is zero
    expect(previousDeck?.creditCostPerQuestion).toBeGreaterThan(0);
    expect(nextDeck?.creditCostPerQuestion).toBeGreaterThan(0);
  });

  it("should handle expired decks gracefully and return a valid next deck", async () => {
    // Mock the authGuard to resolve with a user ID
    (authGuard as jest.Mock).mockResolvedValue({ sub: user1.id });

    // Create an expired deck
    const expiredDeck = await prisma.deck.create({
      data: {
        deck: `Expired Deck ${new Date().getTime()}`,
        revealAtDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Set to 24 hours ago
        activeFromDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
        creditCostPerQuestion: 0,
        deckQuestions: {
          create: {
            question: {
              create: {
                stackId: null,
                question: "Expired Question",
                type: QuestionType.BinaryQuestion,
                revealTokenAmount: 10,
                revealAtDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
                durationMiliseconds: BigInt(60000),
                creditCostPerQuestion: 0,
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
                  ],
                },
              },
            },
          },
        },
      },
    });

    // Add the expired deck ID to our cleanup list
    deckIds.push(expiredDeck.id);

    // Try to get the next deck ID for the expired deck
    const nextDeckId = await getNextDeckId(expiredDeck.id, null);

    // Verify we got a valid next deck ID
    expect(nextDeckId).not.toBeUndefined();

    // Verify the next deck exists and is not expired
    const nextDeck = await prisma.deck.findUnique({
      where: {
        id: nextDeckId,
      },
    });

    expect(nextDeck).not.toBeNull();
    expect(nextDeck?.revealAtDate).toBeInstanceOf(Date);
    expect(nextDeck?.revealAtDate!.getTime()).toBeGreaterThan(Date.now());
  });

  it("should not return a deck that is hidden from the homepage", async () => {
    // Mock the authGuard to resolve with a user ID
    (authGuard as jest.Mock).mockResolvedValue({ sub: user1.id });

    // Get the next deck ID
    const nextDeckId = await getNextDeckId(deckIds[0], null);

    expect(nextDeckId).toBeDefined();

    // Add all the decks to a stack

    const stack = await prisma.stack.create({
      data: {
        name: `test_stack_` + new Date().toISOString(),
        isVisible: true,
        isActive: true,
        hideDeckFromHomepage: false,
        image: "",
      },
    });

    stackId = stack.id;

    await prisma.deck.updateMany({
      data: {
        stackId,
      },
      where: {
        id: { in: deckIds },
      },
    });

    const nextDeckId2 = await getNextDeckId(deckIds[0], null);

    expect(nextDeckId2).toBeDefined();

    // Update stack to hide it

    await prisma.stack.update({
      data: {
        hideDeckFromHomepage: true,
      },
      where: {
        id: stackId,
      },
    });

    // Should now be excluded from the rotation

    const nextDeckId3 = await getNextDeckId(deckIds[0], null);

    expect(nextDeckId3).not.toBe(nextDeckId2);
  });
});
