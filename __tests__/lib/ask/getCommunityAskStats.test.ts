import prisma from "@/app/services/prisma";
import {
  CommunityAskPeriodStats,
  getCommunityAskStats,
} from "@/lib/ask/getCommunityAskStats";
import { generateUsers } from "@/scripts/utils";
import { QuestionType, Token } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

describe("Get community ask list", () => {
  const questionIds: number[] = [];
  let deck: { id: number };
  let users: { id: string }[];
  let origStats: CommunityAskPeriodStats;
  let questionTemplate: any;

  beforeAll(async () => {
    users = await generateUsers(1);

    origStats = await getCommunityAskStats();

    await prisma.user.create({
      data: users[0],
    });

    deck = await prisma.deck.create({
      data: {
        deck: "Deck 1",
        date: new Date(),
        revealAtDate: new Date(),
        creditCostPerQuestion: 2,
      },
    });

    questionTemplate = {
      question: `test_question`,
      type: QuestionType.BinaryQuestion,
      revealToken: Token.Bonk,
      revealTokenAmount: 10,
      revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      durationMiliseconds: BigInt(60000),
      creditCostPerQuestion: 1,
      isSubmittedByUser: true,
      createdByUserId: users[0].id,
      questionOptions: {
        create: [
          {
            option: "A",
            isCorrect: true,
            isLeft: true,
            index: 0,
          },
          {
            option: "B",
            isCorrect: false,
            isLeft: false,
            index: 1,
          },
        ],
      },
    };
  });

  afterAll(async () => {
    await prisma.deckQuestion.deleteMany({
      where: { questionId: { in: questionIds } },
    });
    await prisma.questionOption.deleteMany({
      where: { questionId: { in: questionIds } },
    });
    await prisma.question.deleteMany({
      where: { id: { in: questionIds } },
    });
    await prisma.deck.delete({
      where: { id: deck.id },
    });
    await prisma.user.deleteMany({
      where: { id: { in: users.map((user) => user.id) } },
    });
  });

  it("should test day stat", async () => {
    const newQuestion = {
      ...questionTemplate,
      createdAt: dayjs().startOf("day").add(1, "second").utc().toISOString(),
    };

    const question1 = await prisma.question.create({ data: newQuestion });
    questionIds.push(question1.id);

    const question2 = await prisma.question.create({ data: newQuestion });
    questionIds.push(question2.id);

    const stats = await getCommunityAskStats();

    expect(stats.submittedDay).toBe(2 + origStats.submittedDay);

    origStats = stats;
  });

  it("should fetch week stat", async () => {
    const newQuestion = {
      ...questionTemplate,
      createdAt: dayjs().startOf("week").add(1, "second").utc().toISOString(),
    };

    const question1 = await prisma.question.create({ data: newQuestion });
    questionIds.push(question1.id);

    const stats = await getCommunityAskStats();

    expect(stats.submittedWeek).toBe(1 + origStats.submittedWeek);

    origStats = stats;
  });

  it("should fetch month stat", async () => {
    const newQuestion = {
      ...questionTemplate,
      createdAt: dayjs().startOf("month").add(1, "second").utc().toISOString(),
    };

    const question1 = await prisma.question.create({ data: newQuestion });
    questionIds.push(question1.id);

    const stats = await getCommunityAskStats();

    expect(stats.submittedMonth).toBe(1 + origStats.submittedMonth);

    origStats = stats;
  });

  it("should fetch all-time stat", async () => {
    const newQuestion = {
      ...questionTemplate,
      createdAt: dayjs()
        .startOf("month")
        .subtract(1, "week")
        .utc()
        .toISOString(),
    };

    const question1 = await prisma.question.create({ data: newQuestion });
    questionIds.push(question1.id);

    const stats = await getCommunityAskStats();

    expect(stats.submittedAllTime).toBe(1 + origStats.submittedAllTime);

    origStats = stats;
  });

  it("should fetch accepted stats", async () => {
    await prisma.deckQuestion.createMany({
      data: questionIds.map((id) => ({
        questionId: id,
        deckId: deck.id,
      })),
    });

    const stats = await getCommunityAskStats();

    const questionCount = questionIds.length;

    // Every timeframe should be affected
    expect(stats.acceptedDay).toBe(questionCount + origStats.acceptedDay);
    expect(stats.acceptedWeek).toBe(questionCount + origStats.acceptedWeek);
    expect(stats.acceptedMonth).toBe(questionCount + origStats.acceptedMonth);
    expect(stats.acceptedAllTime).toBe(
      questionCount + origStats.acceptedAllTime,
    );

    origStats = stats;
  });
});
