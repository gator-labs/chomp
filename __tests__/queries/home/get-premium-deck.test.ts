import { deleteDeck } from "@/app/actions/deck/deck";
import { getPremiumDecks } from "@/app/queries/home";
import { getIsUserAdmin } from "@/app/queries/user";
import prisma from "@/app/services/prisma";
import { QuestionType } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

jest.mock("@/lib/auth", () => ({
  authGuard: jest.fn().mockResolvedValue({ sub: "mocked-user-id" }),
}));
jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn().mockResolvedValue({ sub: "mocked-user-id" }),
}));
jest.mock("p-retry", () => ({
  retry: jest.fn((fn) => fn()),
}));
jest.mock("next/headers", () => ({
  headers: jest.fn(() => ({
    get: jest.fn((key) => {
      if (key === "x-path") return "/some-path";
      return null;
    }),
  })),
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}));

// Add redirect mock
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/app/queries/user", () => ({
  getIsUserAdmin: jest.fn().mockResolvedValue(true),
}));

describe("getPremiumDeck", () => {
  const user1 = {
    id: uuidv4(),
    username: `user1`,
  };

  let deckIds: number[] = [];

  beforeAll(async () => {
    // Create users
    await prisma.user.create({ data: user1 });

    // Create decks
    const decksData = [
      {
        data: {
          deck: `Premium Deck ${new Date().getTime()}`,
          revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          activeFromDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          deckQuestions: {
            create: {
              question: {
                create: {
                  stackId: null,
                  question: "Question 1",
                  type: QuestionType.BinaryQuestion,
                  revealTokenAmount: 10,
                  revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
        include: {
          deckQuestions: true,
        },
      },
      {
        data: {
          deck: `Premium Deck ${new Date().getTime()}`,
          revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          revealAtAnswerCount: 2,
          deckQuestions: {
            create: {
              question: {
                create: {
                  stackId: null,
                  question: "Question 2",
                  type: QuestionType.BinaryQuestion,
                  revealTokenAmount: 10,
                  revealAtAnswerCount: 2,
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
        include: {
          deckQuestions: true,
        },
      },
      {
        data: {
          deck: `Premium Deck ${new Date().getTime()}`,
          revealAtAnswerCount: 3,
          revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          activeFromDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          deckQuestions: {
            create: {
              question: {
                create: {
                  stackId: null,
                  question: "Question 3",
                  type: QuestionType.BinaryQuestion,
                  revealTokenAmount: 10,
                  revealAtAnswerCount: 3,
                  creditCostPerQuestion: 1,
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
      },
      {
        data: {
          deck: `Premium Deck ${new Date().getTime()}`,
          revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          activeFromDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          deckQuestions: {
            create: {
              question: {
                create: {
                  stackId: null,
                  question: "Question 4",
                  type: QuestionType.BinaryQuestion,
                  revealTokenAmount: 10,
                  revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
        include: {
          deckQuestions: true,
        },
      },
      {
        data: {
          deck: `Premium Deck ${new Date().getTime()}`,
          revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          activeFromDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          revealAtAnswerCount: 2,
          deckQuestions: {
            create: {
              question: {
                create: {
                  stackId: null,
                  question: "Question 5",
                  type: QuestionType.BinaryQuestion,
                  revealTokenAmount: 10,
                  revealAtAnswerCount: 2,
                  durationMiliseconds: BigInt(60000),
                  revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
        include: {
          deckQuestions: true,
        },
      },
      {
        data: {
          deck: `Premium Deck ${new Date().getTime()}`,
          revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          activeFromDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          revealAtAnswerCount: 3,
          deckQuestions: {
            create: {
              question: {
                create: {
                  stackId: null,
                  question: "Question 6",
                  type: QuestionType.BinaryQuestion,
                  revealTokenAmount: 10,
                  revealAtAnswerCount: 3,
                  durationMiliseconds: BigInt(60000),
                  revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
        include: {
          deckQuestions: true,
        },
      },
      {
        data: {
          deck: `Premium Deck ${new Date().getTime()}`,
          revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          activeFromDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          deckQuestions: {
            create: {
              question: {
                create: {
                  stackId: null,
                  question: "Question 7",
                  type: QuestionType.BinaryQuestion,
                  revealTokenAmount: 10,
                  revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
        include: {
          deckQuestions: true,
        },
      },
      {
        data: {
          deck: `Premium Deck ${new Date().getTime()}`,
          revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          activeFromDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          revealAtAnswerCount: 2,
          deckQuestions: {
            create: {
              question: {
                create: {
                  stackId: null,
                  question: "Question 8",
                  type: QuestionType.BinaryQuestion,
                  revealTokenAmount: 10,
                  revealAtAnswerCount: 2,
                  durationMiliseconds: BigInt(60000),
                  revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
        include: {
          deckQuestions: true,
        },
      },
    ];

    const decks = [];

    for (let i = 0; i < decksData.length; i++) {
      const deck = await prisma.deck.create({
        data: decksData[i].data,
        include: decksData[i].include,
      });
      decks.push(deck);
    }

    deckIds = decks.map((deck) => deck.id);
  });

  afterAll(async () => {
    jest.mocked(getIsUserAdmin).mockResolvedValue(true);
    const deletePromises = deckIds.map((deckId) => deleteDeck(deckId));
    await Promise.all(deletePromises);

    await prisma.user.deleteMany({
      where: {
        id: user1.id,
      },
    });
  });

  it("should return 6 premium decks out of total 8 decks", async () => {
    // (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user1.id });
    const decks = await getPremiumDecks({ pageParam: 1 });
    // fetch deck for first page
    expect(decks.length).toEqual(6);
  });
});
