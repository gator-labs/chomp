import prisma from "@/app/services/prisma";
import { getCommunityAskList } from "@/lib/ask/getCommunityAskList";
import { generateUsers } from "@/scripts/utils";

describe("Get community ask list", () => {
  let question1: { id: number };
  let question2: { id: number };
  let deck: { id: number };
  let users: { id: string }[];

  beforeAll(async () => {
    users = await generateUsers(1);

    await prisma.user.create({
      data: users[0],
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
    await prisma.user.deleteMany({
      where: { id: { in: users.map((user) => user.id) } },
    });
  });

  it("should fetch community quesitons", async () => {
    const askList = await getCommunityAskList();

    expect(askList.length).toBeGreaterThanOrEqual(1);

    const seen = new Set<number>();

    for (let i = 0; i < askList.length; i++) {
      // Should be no duplicates
      expect(seen.has(askList[i].id)).toBeFalsy();
      seen.add(askList[i].id);
    }

    // First question is a community question
    expect(seen.has(question1.id)).toBeTruthy();

    // Second question has a deck, so don't want to see it
    expect(seen.has(question2.id)).toBeFalsy();
  });
});
