import { getStack } from "@/app/queries/stack";
import prisma from "@/app/services/prisma";
import { authGuard } from "@/app/utils/auth";
import dayjs from "dayjs";
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

describe("getStack", () => {
  let stackId: number;
  let deckIds: number[] = [];
  let userId: string;

  beforeAll(async () => {
    userId = uuidv4();

    // Mock auth guard to return our test user
    (authGuard as jest.Mock).mockResolvedValue({ sub: userId });

    await prisma.$transaction(async (tx) => {
      // Create a test stack
      const createdStack = await tx.stack.create({
        data: {
          name: "Test Stack",
          isActive: true,
          isVisible: true,
          image: "https://example.com/test-stack-image.jpg", // Required field from schema
        },
      });
      stackId = createdStack.id;

      // Create decks with various date combinations to test sorting
      const yesterday = dayjs().subtract(1, "day").toDate();
      const tomorrow = dayjs().add(1, "day").toDate();
      const nextWeek = dayjs().add(7, "days").toDate();

      // 1. Deck with null revealAtDate (should appear first)
      const deck1 = await tx.deck.create({
        data: {
          deck: "Deck 1 - Null Reveal Date",
          revealAtDate: null,
          activeFromDate: yesterday,
          stackId: createdStack.id,
        },
      });

      // 2. Another deck with null revealAtDate but different activeFromDate
      const deck2 = await tx.deck.create({
        data: {
          deck: "Deck 2 - Null Reveal Date",
          revealAtDate: null,
          activeFromDate: tomorrow,
          stackId: createdStack.id,
        },
      });

      // 3. Deck with future revealAtDate
      const deck3 = await tx.deck.create({
        data: {
          deck: "Deck 3 - Future Reveal",
          revealAtDate: nextWeek,
          activeFromDate: tomorrow,
          stackId: createdStack.id,
        },
      });

      // 4. Two decks with same revealAtDate but different activeFromDate
      const deck4 = await tx.deck.create({
        data: {
          deck: "Deck 4 - Same Reveal as 5",
          revealAtDate: tomorrow,
          activeFromDate: yesterday, // Past active date
          stackId: createdStack.id,
        },
      });

      const deck5 = await tx.deck.create({
        data: {
          deck: "Deck 5 - Same Reveal as 4",
          revealAtDate: tomorrow,
          activeFromDate: nextWeek, // Future active date
          stackId: createdStack.id,
        },
      });

      deckIds = [deck1.id, deck2.id, deck3.id, deck4.id, deck5.id];
    });
  });

  afterAll(async () => {
    await prisma.$transaction(async (tx) => {
      // Clean up decks
      await tx.deck.deleteMany({
        where: {
          id: {
            in: deckIds,
          },
        },
      });

      // Clean up stack
      await tx.stack.delete({
        where: {
          id: stackId,
        },
      });
    });
  });

  it("should return null for non-existent stack", async () => {
    const result = await getStack(999999);
    expect(result).toBeNull();
  });

  it("should sort decks with null revealAtDate first", async () => {
    const result = await getStack(stackId);
    expect(result).not.toBeNull();

    // First two decks should be the ones with null revealAtDate
    expect(result!.deck[0].revealAtDate).toBeNull();
    expect(result!.deck[1].revealAtDate).toBeNull();

    // Verify they are sorted by activeFromDate (yesterday before tomorrow)
    expect(result!.deck[0].deck).toBe("Deck 1 - Null Reveal Date"); // yesterday
    expect(result!.deck[1].deck).toBe("Deck 2 - Null Reveal Date"); // tomorrow
  });

  it("should sort remaining decks by revealAtDate in descending order", async () => {
    const result = await getStack(stackId);
    expect(result).not.toBeNull();

    // After null dates, deck3 (nextWeek) should come before deck4/deck5 (tomorrow)
    const nonNullDecks = result!.deck.slice(2);
    expect(nonNullDecks[0].deck).toBe("Deck 3 - Future Reveal");
    expect(nonNullDecks[1].deck).toBe("Deck 4 - Same Reveal as 5");
    expect(nonNullDecks[2].deck).toBe("Deck 5 - Same Reveal as 4");
  });

  it("should sort decks with same revealAtDate by activeFromDate status", async () => {
    const result = await getStack(stackId);
    expect(result).not.toBeNull();

    // Find the two decks with same revealAtDate (tomorrow)
    const sameRevealDecks = result!.deck.filter((d) =>
      d.deck.includes("Same Reveal"),
    );
    expect(sameRevealDecks).toHaveLength(2);

    // Deck4 (past active date) should come before Deck5 (future active date)
    expect(sameRevealDecks[0].deck).toBe("Deck 4 - Same Reveal as 5");
    expect(sameRevealDecks[1].deck).toBe("Deck 5 - Same Reveal as 4");
  });

  it("should maintain the stack structure with all fields", async () => {
    const result = await getStack(stackId);
    expect(result).not.toBeNull();

    // Verify stack fields are preserved
    expect(result).toHaveProperty("id", stackId);
    expect(result).toHaveProperty("name", "Test Stack");
    expect(result).toHaveProperty("isActive", true);
    expect(result).toHaveProperty("isVisible", true);
    expect(result).toHaveProperty("image");
    expect(result).toHaveProperty("deck");
    expect(Array.isArray(result!.deck)).toBe(true);
  });
});
