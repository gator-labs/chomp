import prisma from "@/app/services/prisma";
import { getPointBalance } from "@/lib/points/getPointBalance";
import { generateUsers } from "@/scripts/utils";
import { ESpecialStack } from "@prisma/client";

describe("Ask DB triggers", () => {
  let questions: { id: number }[] = [];
  let deck: { id: number };
  let communityDeck: { id: number };
  let origCommunityStack: { id: number } | null;
  let users: { id: string; username: string }[];

  beforeAll(async () => {
    users = await generateUsers(2);

    await prisma.user.createMany({
      data: users,
    });

    origCommunityStack = await prisma.stack.findUnique({
      where: { specialId: ESpecialStack.CommunityAsk },
    });

    let communityStack = origCommunityStack
      ? origCommunityStack
      : await prisma.stack.create({
          data: {
            name: "Test community stack",
            isActive: true,
            image: "",
            specialId: ESpecialStack.CommunityAsk,
          },
        });

    communityDeck = await prisma.deck.create({
      data: {
        deck: "Test community deck",
        stackId: communityStack.id,
      },
    });

    const question0 = await prisma.question.create({
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

    const question1 = await prisma.question.create({
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

    questions.push(question0);
    questions.push(question1);
  });

  afterAll(async () => {
    if (users) {
      await prisma.askQuestionAnswer.deleteMany({
        where: { userId: { in: users.map((q) => q.id) } },
      });
    }
    await prisma.deckQuestion.deleteMany({
      where: { questionId: { in: questions.map((q) => q.id) } },
    });
    await prisma.questionOption.deleteMany({
      where: { questionId: { in: questions.map((q) => q.id) } },
    });
    await prisma.question.deleteMany({
      where: { id: { in: questions.map((q) => q.id) } },
    });
    await prisma.deck.delete({ where: { id: deck.id } });

    if (communityDeck)
      await prisma.deck.delete({ where: { id: communityDeck.id } });

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

      await prisma.user.deleteMany({
        where: { id: { in: users.map((u) => u.id) } },
      });
    }
  });

  it("should not invoke acceptance points for general deck", async () => {
    const authorPointsBalanceBefore = await getPointBalance(users[0].id);

    const dq = await prisma.deckQuestion.create({
      data: {
        questionId: questions[0].id,
        deckId: deck.id,
      },
    });

    const authorPointsBalanceAfter = await getPointBalance(users[0].id);

    expect(process.env.NEXT_PUBLIC_ASK_ACCEPTED_POINTS_REWARD).toBeDefined();
    expect(authorPointsBalanceAfter).toEqual(authorPointsBalanceBefore);

    await prisma.deckQuestion.delete({ where: { id: dq.id } });
  });

  it("should invoke acceptance trigger for community deck", async () => {
    const authorPointsBalanceBefore = await getPointBalance(users[0].id);

    const dq = await prisma.deckQuestion.create({
      data: {
        questionId: questions[0].id,
        deckId: communityDeck.id,
      },
    });

    const authorPointsBalanceAfter = await getPointBalance(users[0].id);

    expect(process.env.NEXT_PUBLIC_ASK_ACCEPTED_POINTS_REWARD).toBeDefined();
    expect(authorPointsBalanceAfter - authorPointsBalanceBefore).toEqual(
      Number(process.env.NEXT_PUBLIC_ASK_ACCEPTED_POINTS_REWARD),
    );

    await prisma.deckQuestion.delete({ where: { id: dq.id } });
  });

  it("should invoke answer trigger for question", async () => {
    const dq = await prisma.deckQuestion.create({
      data: {
        questionId: questions[0].id,
        deckId: communityDeck.id,
      },
    });

    expect(process.env.NEXT_PUBLIC_ASK_ANSWERED_POINTS_REWARD).toBeDefined();

    const authorPointsBalanceBefore = await getPointBalance(users[0].id);

    const options = await prisma.questionOption.findMany({
      where: {
        questionId: questions[0].id,
      },
    });

    // Answers missing first and second order.
    // No points should be awarded.

    await prisma.questionAnswer.createMany({
      data: options.map((qo) => ({
        questionOptionId: qo.id,
        userId: users[1].id,
        selected: false,
        percentage: null,
      })),
    });

    let authorPointsBalanceAfter = await getPointBalance(users[0].id);
    expect(authorPointsBalanceAfter).toEqual(authorPointsBalanceBefore);

    expect(authorPointsBalanceAfter).toEqual(authorPointsBalanceBefore);

    await prisma.questionAnswer.deleteMany({
      where: { userId: users[1].id },
    });

    // Answers missing second order. No points should be awarded.

    await prisma.questionAnswer.createMany({
      data: options.map((qo, i) => ({
        questionOptionId: qo.id,
        userId: users[1].id,
        selected: i === 1,
        percentage: null,
      })),
    });

    authorPointsBalanceAfter = await getPointBalance(users[0].id);
    expect(authorPointsBalanceAfter).toEqual(authorPointsBalanceBefore);

    await prisma.questionAnswer.deleteMany({
      where: { userId: users[1].id },
    });

    // Answers missing first order. No points should be awarded.

    await prisma.questionAnswer.createMany({
      data: options.map((qo, i) => ({
        questionOptionId: qo.id,
        userId: users[1].id,
        selected: false,
        percentage: i === 1 ? 50 : null,
      })),
    });

    authorPointsBalanceAfter = await getPointBalance(users[0].id);
    expect(authorPointsBalanceAfter).toEqual(authorPointsBalanceBefore);

    await prisma.questionAnswer.deleteMany({
      where: { userId: users[1].id },
    });

    // Answers complete. Should get points.

    await prisma.questionAnswer.createMany({
      data: options.map((qo, i) => ({
        questionOptionId: qo.id,
        userId: users[1].id,
        selected: i == 0,
        percentage: i === 1 ? 50 : null,
      })),
    });

    authorPointsBalanceAfter = await getPointBalance(users[0].id);
    expect(authorPointsBalanceAfter - authorPointsBalanceBefore).toEqual(
      Number(process.env.NEXT_PUBLIC_ASK_ANSWERED_POINTS_REWARD),
    );

    await prisma.questionAnswer.deleteMany({
      where: { userId: users[1].id },
    });

    // User should not get any more points for duplicate question

    await prisma.questionAnswer.createMany({
      data: options.map((qo, i) => ({
        questionOptionId: qo.id,
        userId: users[1].id,
        selected: i == 0,
        percentage: i === 1 ? 50 : null,
      })),
    });

    authorPointsBalanceAfter = await getPointBalance(users[0].id);
    expect(authorPointsBalanceAfter - authorPointsBalanceBefore).toEqual(
      Number(process.env.NEXT_PUBLIC_ASK_ANSWERED_POINTS_REWARD),
    );

    await prisma.questionAnswer.deleteMany({
      where: { userId: users[1].id },
    });

    await prisma.deckQuestion.delete({ where: { id: dq.id } });
  });
});
