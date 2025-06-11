import prisma from "@/app/services/prisma";
import { addToCommunityDeck } from "@/lib/ask/addToCommunityDeck";
import { createCommunityDeck } from "@/lib/ask/createCommunityDeck";
import { getPointBalance } from "@/lib/points/getPointBalance";
import { generateUsers } from "@/scripts/utils";
import { ESpecialStack } from "@prisma/client";

describe("Add to community ask list", () => {
  let question1: { id: number };
  let question2: { id: number };
  let deck: { id: number };
  let origCommunityStack: { id: number } | null;
  let origCommunityDecks: { id: number }[];
  let users: { id: string; username: string }[];
  let communityDeckId: number;

  beforeAll(async () => {
    users = await generateUsers(1);

    await prisma.user.createMany({
      data: users,
    });

    origCommunityStack = await prisma.stack.findUnique({
      where: { specialId: ESpecialStack.CommunityAsk },
    });

    origCommunityDecks = await prisma.deck.findMany({
      where: { stack: { specialId: ESpecialStack.CommunityAsk } },
    });

    question1 = await prisma.question.create({
      data: {
        stackId: null,
        question: "User question",
        type: "BinaryQuestion",
        revealTokenAmount: 10,
        isSubmittedByUser: true,
        createdByUserId: users[0].id,
        questionOptions: {
          create: [
            {
              option: "Cats",
              index: 0,
            },
            {
              option: "Dogs",
              index: 1,
            },
          ],
        },
      },
    });

    deck = await prisma.deck.create({
      data: {
        deck: "Deck Sample",
        revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        stackId: null,
      },
      include: {
        deckQuestions: true,
      },
    });

    question2 = await prisma.question.create({
      data: {
        stackId: null,
        question: "Non-user question",
        type: "BinaryQuestion",
        revealTokenAmount: 10,
        isSubmittedByUser: false,
        questionOptions: {
          create: [
            {
              option: "Fauna",
              index: 0,
            },
            {
              option: "Flora",
              index: 1,
            },
          ],
        },
        deckQuestions: {
          create: {
            deckId: deck.id,
          },
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.deckQuestion.deleteMany({
      where: { questionId: { in: [question1.id, question2.id] } },
    });
    await prisma.questionOption.deleteMany({
      where: { questionId: { in: [question1.id, question2.id] } },
    });
    await prisma.question.deleteMany({
      where: { id: { in: [question1.id, question2.id] } },
    });
    await prisma.deck.delete({ where: { id: deck.id } });

    await prisma.deck.deleteMany({
      where: {
        stack: { specialId: ESpecialStack.CommunityAsk },
        id: { notIn: origCommunityDecks.map((d) => d.id) },
      },
    });

    if (!origCommunityStack)
      await prisma.stack.delete({
        where: { specialId: ESpecialStack.CommunityAsk },
      });

    if (users) {
      await prisma.fungibleAssetTransactionLog.deleteMany({
        where: {
          userId: { in: users.map((u) => u.id) },
        },
      });

      await prisma.userBalance.deleteMany({
        where: {
          userId: { in: users.map((u) => u.id) },
        },
      });

      await prisma.user.deleteMany({
        where: { id: { in: users.map((u) => u.id) } },
      });
    }
  });

  it("should create a community deck", async () => {
    const title = "Test" + new Date().getTime();
    communityDeckId = await createCommunityDeck(title);

    expect(communityDeckId).toBeDefined();

    const deck = await prisma.deck.findFirst({
      where: {
        id: communityDeckId,
      },
      include: {
        stack: true,
      },
    });

    expect(deck).toBeDefined();
    expect(deck?.stack?.specialId).toBe(ESpecialStack.CommunityAsk);
    expect(deck?.deck).toBe(title);
  });

  it("should not add a question to an arbitrary deck", async () => {
    const newDeck = await prisma.deck.create({
      data: {
        deck: "TestDeck",
      },
    });

    await expect(
      addToCommunityDeck(question1.id, newDeck.id),
    ).rejects.toThrow();

    await prisma.deck.delete({ where: { id: newDeck.id } });
  });

  it("should add a community question to list", async () => {
    const authorPointsBalanceBefore = await getPointBalance(users[0].id);

    await addToCommunityDeck(question1.id, communityDeckId);

    const authorPointsBalanceAfter = await getPointBalance(users[0].id);

    expect(process.env.NEXT_PUBLIC_ASK_ACCEPTED_POINTS_REWARD).toBeDefined();
    expect(authorPointsBalanceAfter - authorPointsBalanceBefore).toEqual(
      Number(process.env.NEXT_PUBLIC_ASK_ACCEPTED_POINTS_REWARD),
    );

    const communityStack = await prisma.stack.findUnique({
      where: { specialId: ESpecialStack.CommunityAsk },
    });

    expect(communityStack).toBeDefined();

    const lastCommunityDeck = await prisma.deck.findFirst({
      where: {
        stackId: communityStack!.id,
        OR: [{ activeFromDate: null }, { activeFromDate: { gt: new Date() } }],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    expect(lastCommunityDeck).toBeDefined();

    const q1 = await prisma.question.findUnique({
      where: { id: question1.id },
      include: { deckQuestions: true },
    });

    expect(q1?.deckQuestions?.[0]?.deckId).toEqual(lastCommunityDeck!.id);
  });

  it("should not add an arbitrary question to list", async () => {
    await expect(
      addToCommunityDeck(question2.id, communityDeckId),
    ).rejects.toThrow();
  });
});
