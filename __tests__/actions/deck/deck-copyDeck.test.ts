import { copyDeck } from "@/app/actions/deck/copyDeck";
import { deleteDeck } from "@/app/actions/deck/deck";
import prisma from "@/app/services/prisma";

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

// Set.isDisjointFrom() Polyfill (need Node v22)
const isDisjointFrom = (set1: Set<number>, set2: Set<number>) => {
  const arrSet1 = Array.from(set1);
  for (const elem of arrSet1) {
    if (set2.has(elem)) return false;
  }
  return true;
};

describe("Copying a Deck", () => {
  let deckId: number | undefined = undefined;
  let newDeckId: number | undefined = undefined;
  let tagId: number | undefined = undefined;

  // Add mock deck with one question and a user to database
  beforeAll(async () => {
    const tag = await prisma.tag.create({
      data: {
        tag: `Tag_CopyTest_${new Date().toISOString()}`,
      },
    });

    tagId = tag.id;

    const question = {
      create: {
        stackId: null,
        question: "Bonkaton question?",
        type: "MultiChoice",
        revealTokenAmount: 10,
        revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        durationMiliseconds: BigInt(60000),
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1280px-Wikipedia-logo-v2.svg.png",
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
        questionTags: {
          create: [{ tagId }],
        },
      },
    };

    const deck = await prisma.deck.create({
      data: {
        deck: `deck_test ${new Date().toISOString()}`,
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1280px-Wikipedia-logo-v2.svg.png",
        revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        stackId: null,
        deckQuestions: {
          create: Array(5).fill({ question }),
        },
      },
      include: {
        deckQuestions: true,
      },
    });

    deckId = deck.id;
  });

  // delete all the deck and user data after all the test run
  afterAll(async () => {
    if (newDeckId) await deleteDeck(newDeckId);
    if (deckId) await deleteDeck(deckId);
    if (tagId) await prisma.tag.delete({ where: { id: tagId } });
  });

  it("should test isDisjointFrom() polyfill", async () => {
    const set1 = new Set([1, 2, 3]);
    const set2 = new Set([4, 5, 6, 1]);
    const set3 = new Set([7, 8, 9]);

    expect(isDisjointFrom(set1, set2)).toBeFalsy();
    expect(isDisjointFrom(set2, set1)).toBeFalsy();
    expect(isDisjointFrom(set1, set3)).toBeTruthy();
    expect(isDisjointFrom(set3, set1)).toBeTruthy();
  });

  it("should copy a deck", async () => {
    if (!deckId) throw new Error("deckId not defined");

    newDeckId = await copyDeck(deckId);

    const newDeck = await prisma.deck.findUnique({
      where: { id: newDeckId },
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

    const newDeckQuestionIds = new Set(
      newDeck?.deckQuestions.map((dq) => dq.id),
    );
    const newQuestionIds = new Set(
      newDeck?.deckQuestions.map((dq) => dq.question.id),
    );
    const newQuestionOptionIds = new Set(
      newDeck?.deckQuestions.flatMap((dq) =>
        dq.question.questionOptions.map((qo) => qo.id),
      ),
    );
    const newQuestionTagIds = new Set(
      newDeck?.deckQuestions.flatMap((dq) =>
        dq.question.questionTags.map((qt) => qt.id),
      ),
    );
    const newTagIds = new Set(
      newDeck?.deckQuestions.flatMap((dq) =>
        dq.question.questionTags.map((qt) => qt.tagId),
      ),
    );

    const newUrls =
      newDeck?.deckQuestions.map((dq) => dq.question.imageUrl) ?? [];

    const origDeck = await prisma.deck.findUnique({
      where: { id: deckId },
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

    const origDeckQuestionIds = new Set(
      origDeck?.deckQuestions.map((dq) => dq.id),
    );
    const origQuestionIds = new Set(
      origDeck?.deckQuestions.map((dq) => dq.question.id),
    );
    const origQuestionOptionIds = new Set(
      origDeck?.deckQuestions.flatMap((dq) =>
        dq.question.questionOptions.map((qo) => qo.id),
      ),
    );
    const origQuestionTagIds = new Set(
      origDeck?.deckQuestions.flatMap((dq) =>
        dq.question.questionTags.map((qt) => qt.id),
      ),
    );
    const origTagIds = new Set(
      origDeck?.deckQuestions.flatMap((dq) =>
        dq.question.questionTags.map((qt) => qt.tagId),
      ),
    );

    expect(newDeckId).toBeDefined();
    expect(newDeckId).not.toBe(deckId);
    expect(newDeckQuestionIds.size).toBe(origDeckQuestionIds.size);
    expect(newQuestionIds.size).toBe(origQuestionIds.size);
    expect(newQuestionOptionIds.size).toBe(origQuestionOptionIds.size);
    expect(
      isDisjointFrom(newDeckQuestionIds, origDeckQuestionIds),
    ).toBeTruthy();
    expect(isDisjointFrom(newQuestionIds, origQuestionIds)).toBeTruthy();
    expect(
      isDisjointFrom(newQuestionOptionIds, origQuestionOptionIds),
    ).toBeTruthy();
    expect(isDisjointFrom(newQuestionTagIds, origQuestionTagIds)).toBeTruthy();
    expect(newTagIds.size).toBe(1);
    expect(origTagIds.size).toBe(1);
    expect(Array.from(newTagIds)[0]).toBe(Array.from(origTagIds)[0]);
    expect(newDeck?.revealAtDate).toBeNull();
    expect(newDeck?.activeFromDate).toBeNull();
    expect(newDeck?.imageUrl).toBeNull();

    for (let i = 0; i < newUrls.length; i++) {
      expect(newUrls[i]).toBeNull();
    }
  });
});
