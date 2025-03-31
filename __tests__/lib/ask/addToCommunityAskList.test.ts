import prisma from "@/app/services/prisma";
import { addToCommunityDeck } from "@/lib/ask/addToCommunityDeck";
import { ESpecialStack } from "@prisma/client";

describe("Add to community ask list", () => {
  let question1: { id: number };
  let question2: { id: number };
  let deck: { id: number };
  let origCommunityStack: { id: number } | null;
  let origCommunityDeck: { id: number } | null;

  beforeAll(async () => {
    origCommunityStack = await prisma.stack.findUnique({
      where: { specialId: ESpecialStack.CommunityAsk },
    });

    origCommunityDeck = await prisma.stack.findUnique({
      where: { specialId: ESpecialStack.CommunityAsk },
    });

    question1 = await prisma.question.create({
      data: {
        stackId: null,
        question: "User question",
        type: "BinaryQuestion",
        revealTokenAmount: 10,
        isSubmittedByUser: true,
        questionOptions: {
          create: [
            {
              option: "Cats",
            },
            {
              option: "Dogs",
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
            },
            {
              option: "Flora",
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

    if (!origCommunityDeck)
      await prisma.deck.deleteMany({
        where: { stack: { specialId: ESpecialStack.CommunityAsk } },
      });

    if (!origCommunityStack)
      await prisma.stack.delete({
        where: { specialId: ESpecialStack.CommunityAsk },
      });
  });

  it("should add a community question to list", async () => {
    await addToCommunityDeck(question1.id);

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
    await expect(addToCommunityDeck(question2.id)).rejects.toThrow();
  });
});
