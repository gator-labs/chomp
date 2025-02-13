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
    const yesterday = dayjs().subtract(1, "day").toDate();
    const tomorrow = dayjs().add(1, "day").toDate();
    const nextWeek = dayjs().add(7, "days").toDate();
    const lastWeek = dayjs().subtract(7, "days").toDate();

    // 1. Deck with null revealAtDate (should appear first)
    const deckData = [
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
      {
        data: {
          deck: "Deck 3 - Future Reveal",
          revealAtDate: nextWeek,
          activeFromDate: yesterday, // Past active date (makes it open)
          stackId: createdStack.id,
        },
      },
      {
        data: {
          deck: "Deck 4 - Same Reveal as 5",
          revealAtDate: tomorrow,
          activeFromDate: yesterday, // Past active date (makes it open)
          stackId: createdStack.id,
        },
      },
      {
        data: {
          deck: "Deck 5 - Same Reveal as 4",
          revealAtDate: tomorrow,
          activeFromDate: nextWeek, // Future active date (makes it upcoming)
          stackId: createdStack.id,
        },
      },
      {
        data: {
          deck: "Deck 6 - Open Now",
          revealAtDate: dayjs().add(2, "days").toDate(), // Between tomorrow and nextWeek
          activeFromDate: lastWeek, // Past active date (makes it open)
          stackId: createdStack.id,
        },
      },
      {
        data: {
          deck: "Deck 7 - Closed",
          revealAtDate: yesterday, // Past reveal date (makes it closed)
          activeFromDate: lastWeek,
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

  it("should sort open decks by revealAtDate in ascending order after null dates", async () => {
    const result = await getStack(stackId);
    expect(result).not.toBeNull();

    // After null dates, open decks should be sorted by revealAtDate ascending
    const nonNullDecks = result!.deck.slice(2);
    expect(nonNullDecks[0].deck).toBe("Deck 4 - Same Reveal as 5"); // Tomorrow
    expect(nonNullDecks[1].deck).toBe("Deck 6 - Open Now"); // Day after tomorrow
    expect(nonNullDecks[2].deck).toBe("Deck 3 - Future Reveal"); // Next week
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

  it("should correctly sort mixed states (open, upcoming, and closed decks)", async () => {
    const result = await getStack(stackId);
    expect(result).not.toBeNull();

    // Find decks by their state based on sorting logic
    // Find an open deck (Deck 4 or 6)
    const openDeck = result!.deck.find(
      (d) => d.deck.includes("Deck 4") || d.deck.includes("Deck 6"),
    );

    // Find an upcoming deck (Deck 5)
    const upcomingDeck = result!.deck.find((d) => d.deck.includes("Deck 5"));

    // Find a closed deck (Deck 7)
    const closedDeck = result!.deck.find((d) => d.deck.includes("Deck 7"));

    // Verify open decks come before upcoming decks
    if (openDeck && upcomingDeck) {
      const openIndex = result!.deck.indexOf(openDeck);
      const upcomingIndex = result!.deck.indexOf(upcomingDeck);
      expect(openIndex).toBeLessThan(upcomingIndex);
    }

    // Verify upcoming decks come before closed decks
    if (upcomingDeck && closedDeck) {
      const upcomingIndex = result!.deck.indexOf(upcomingDeck);
      const closedIndex = result!.deck.indexOf(closedDeck);
      expect(upcomingIndex).toBeLessThan(closedIndex);
    }
  });

  it("should handle boundary dates (exactly now)", async () => {
    const now = new Date();

    // Create a deck that starts exactly now
    const deckData = [
      {
        data: {
          deck: "Deck - Starting Now",
          revealAtDate: dayjs().add(1, "day").toDate(),
          activeFromDate: now,
          stackId: stackId,
        },
      },
      {
        data: {
          deck: "Deck - Revealing Now",
          revealAtDate: now,
          activeFromDate: dayjs().subtract(1, "day").toDate(),
          stackId: stackId,
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

    const deckIds = decks.map((deck) => deck.id);

    const result = await getStack(stackId);
    expect(result).not.toBeNull();

    // Find our boundary test decks
    const startingNowDeck = result!.deck.find(
      (d) => d.deck === "Deck - Starting Now",
    );
    const revealingNowDeck = result!.deck.find(
      (d) => d.deck === "Deck - Revealing Now",
    );

    expect(startingNowDeck).toBeDefined();
    expect(revealingNowDeck).toBeDefined();

    // A deck starting now should be considered "open"
    // A deck revealing now should be considered "closed"
    const startingNowIndex = result!.deck.indexOf(startingNowDeck!);
    const revealingNowIndex = result!.deck.indexOf(revealingNowDeck!);
    expect(startingNowIndex).toBeLessThan(revealingNowIndex);

    // Clean up decks
    await prisma.deck.deleteMany({
      where: {
        id: { in: deckIds },
      },
    });
  });

  it("should handle missing or invalid date combinations", async () => {
    const deckData = [
      {
        data: {
          deck: "Deck - Missing ActiveFrom",
          revealAtDate: dayjs().add(1, "day").toDate(),
          activeFromDate: null,
          stackId: stackId,
        },
      },
      {
        data: {
          deck: "Deck - Missing Reveal",
          revealAtDate: null,
          activeFromDate: dayjs().subtract(1, "day").toDate(),
          stackId: stackId,
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

    const deckIds = decks.map((deck) => deck.id);

    const result = await getStack(stackId);
    expect(result).not.toBeNull();

    // Verify decks with missing dates are included in results
    const missingActiveDeck = result!.deck.find(
      (d) => d.deck === "Deck - Missing ActiveFrom",
    );
    const missingRevealDeck = result!.deck.find(
      (d) => d.deck === "Deck - Missing Reveal",
    );

    expect(missingActiveDeck).toBeDefined();
    expect(missingRevealDeck).toBeDefined();

    // Clean up decks
    await prisma.deck.deleteMany({
      where: {
        id: { in: deckIds },
      },
    });
  });
});
