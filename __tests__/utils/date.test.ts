import { deleteDeck } from "@/app/actions/deck/deck";
import { getUsersLatestStreak } from "@/app/queries/home";
import prisma from "@/app/services/prisma";
import { authGuard } from "@/app/utils/auth";
import { getStartAndEndOfDay, getWeekStartAndEndDates } from "@/app/utils/date";
import { generateUsers } from "@/scripts/utils";
import { endOfWeek } from "date-fns";

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));
jest.mock("@/app/utils/auth", () => ({
  authGuard: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}));
jest.mock("p-retry", () => ({
  retry: jest.fn((fn) => fn()),
}));

describe("Time-Based Chomp Actions", () => {
  const currentDate = new Date();

  describe("Daily Leaderboard Refresh", () => {
    test("Refreshes daily at midnight UTC", () => {
      const currentDate = new Date();

      // Get calculated end date from utility
      const { endOfTheDay: calculatedEndDate } =
        getStartAndEndOfDay(currentDate);

      // Manually compute the expected end date
      const expectedEndDate = new Date(currentDate);
      expectedEndDate.setUTCHours(23, 59, 59, 999);

      // Assert the calculated end date matches the expected end date
      expect(calculatedEndDate.toISOString()).toBe(
        expectedEndDate.toISOString(),
      );
    });
  });

  describe("Weekly Leaderboard Refresh", () => {
    test("Ends on Sundays at 23:59:59 UTC", () => {
      // Get calculated end date from utility
      const { endDateOfTheWeek: calculatedEndDate } =
        getWeekStartAndEndDates(currentDate);

      // Manually compute the expected end date of the week
      const expectedEndDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      expectedEndDate.setUTCHours(23, 59, 59, 999);

      // Assert the calculated end date matches the expected end date
      expect(calculatedEndDate.toISOString()).toBe(
        expectedEndDate.toISOString(),
      );
    });
  });

  describe("Streak Recording", () => {
    let user: { id: string; username: string }[];
    let deckId: number;
    beforeAll(async () => {
      const deck = await prisma.deck.create({
        data: {
          deck: `deck ${currentDate}`,
          revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          stackId: null,
          deckQuestions: {
            create: {
              question: {
                create: {
                  stackId: null,
                  question: "Bonkaton question?",
                  type: "MultiChoice",
                  revealTokenAmount: 10,
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
                      {
                        option: "C",
                        isCorrect: false,
                        isLeft: false,
                      },
                      {
                        option: "D",
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
      });
      deckId = deck.id;
      user = await generateUsers(1);
      await prisma.user.createMany({
        data: user,
      });

      const questionOptions = await prisma.questionOption.findMany({
        where: {
          question: {
            deckQuestions: {
              some: {
                deckId: deck.id,
              },
            },
          },
        },
      });

      const selectedOption = questionOptions[Math.floor(Math.random() * 4)];
      // Simulate users answering the question with the specified option
      for (const option of questionOptions) {
        // Random percentage for the first option
        const randomPercentage = Math.floor(Math.random() * 100);
        // Calculate the remaining percentage for the other option
        const remainingPercentage = 100 - randomPercentage;
        const isSelectedOption =
          option.id ===
          (selectedOption
            ? selectedOption.id
            : questionOptions[
                Math.floor(Math.random() * questionOptions.length)
              ].id);

        // Apply percentages such that they sum up to 100 for each user's answer set
        await prisma.questionAnswer.create({
          data: {
            userId: user[0]?.id,
            questionOptionId: option.id,
            percentage: option.isLeft ? randomPercentage : remainingPercentage,
            selected: isSelectedOption,
            timeToAnswer: BigInt(Math.floor(Math.random() * 60000)), // Random time to answer within 60 seconds
          },
        });
      }
    });

    afterAll(async () => {
      await deleteDeck(deckId);

      await prisma.user.delete({
        where: {
          id: user[0].id,
        },
      });
    });

    test("Records streaks only at midnight UTC", async () => {
      const mockPayload = { sub: user[0].id };
      (authGuard as jest.Mock).mockResolvedValue(mockPayload);
      const streak = await getUsersLatestStreak();

      expect(streak).toBe(1);
    });

    test("Records streaks only at midnight UTC", async () => {
      const records = await prisma.questionAnswer.findMany({
        where: {
          userId: user[0].id,
          status: "Submitted",
        },
        select: {
          id: true,
          createdAt: true,
        },
      });

      const adjustedDate = new Date(records[0].createdAt);

      // Subtract 2 day
      adjustedDate.setUTCDate(adjustedDate.getUTCDate() - 2);

      // Set to EOD UTC (23:59:59.999)
      adjustedDate.setUTCHours(23, 59, 59, 999);

      await prisma.questionAnswer.updateMany({
        where: {
          userId: user[0].id,
          status: "Submitted",
        },
        data: {
          createdAt: adjustedDate,
        },
      });

      const mockPayload = { sub: user[0].id };
      (authGuard as jest.Mock).mockResolvedValue(mockPayload);
      const streak = await getUsersLatestStreak();

      expect(streak).toBe(0);
    });
  });
});
