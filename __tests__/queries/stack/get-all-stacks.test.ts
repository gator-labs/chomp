import { getJwtPayload } from "@/app/actions/jwt";
import { getAllStacks } from "@/app/queries/stack";
import prisma from "@/app/services/prisma";
import { authGuard } from "@/app/utils/auth";
import { v4 as uuidv4 } from "uuid";

// Mock retry since it's used in the codebase
jest.mock("p-retry", () => ({
  retry: jest.fn((fn) => fn()),
}));

// Mock authGuard since it's used in getStack
jest.mock("@/app/utils/auth", () => ({
  authGuard: jest.fn(),
}));

// Mock JWT payload since it's used in getStack
jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));

describe("getAllStacks", () => {
  let stackId: number;
  let createdDeckIds: number[] = [];
  let userId: string;

  beforeAll(async () => {
    userId = uuidv4();

    // Mock auth guard to return our test user
    (authGuard as jest.Mock).mockResolvedValue({ sub: userId });

    // Create a test stack
    const createdStack = await prisma.stack.create({
      data: {
        name: "Test Stack",
        isActive: true,
        isVisible: true,
        image: "https://example.com/test-stack-image.jpg", // Required field from schema
      },
    });
    stackId = createdStack.id;

    // Create decks with various date combinations to test sorting
    const baseDate = new Date();
    baseDate.setUTCHours(12, 0, 0, 0); // Set to noon UTC to avoid day boundary issues

    const yesterday = new Date(baseDate);
    yesterday.setUTCDate(baseDate.getUTCDate() - 1);

    const tomorrow = new Date(baseDate);
    tomorrow.setUTCDate(baseDate.getUTCDate() + 1);

    const deckData = [
      // 1. Deck with null revealAtDate (should appear first)
      {
        data: {
          deck: "Deck 1 - Null Reveal Date",
          revealAtDate: null,
          activeFromDate: yesterday,
          stackId: createdStack.id,
        },
      },
      {
        data: {
          deck: "Deck 2 - Null Reveal Date",
          revealAtDate: null,
          activeFromDate: tomorrow,
          stackId: createdStack.id,
        },
      },
    ];

    const decks = [];

    for (let i = 0; i < deckData.length; i++) {
      const deck = await prisma.deck.create({
        data: deckData[i].data,
      });
      decks.push(deck);
    }

    createdDeckIds = decks.map((deck) => deck.id);
  });

  afterAll(async () => {
    // Clean up decks
    await prisma.deck.deleteMany({
      where: {
        id: {
          in: createdDeckIds,
        },
      },
    });

    // Clean up stack
    await prisma.stack.delete({
      where: {
        id: stackId,
      },
    });
  });

  it("should return all the stacks for logged out users", async () => {
    const result = await getAllStacks();
    const stack = result.find((s) => s.id === stackId);

    expect(stack?.isVisible).toBe(true);
  });
  it("should return all the stacks for logged in users", async () => {
    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: userId });
    (authGuard as jest.Mock).mockResolvedValue({ sub: userId });
    const result = await getAllStacks();
    const stack = result.find((s) => s.id === stackId);

    expect(stack?.isVisible).toBe(true);
  });
});
