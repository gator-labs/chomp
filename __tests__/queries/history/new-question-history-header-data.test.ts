import { getHistoryHeadersData } from "@/app/queries/history";
import prisma from "@/app/services/prisma";

jest.mock("@/app/services/prisma", () => ({
  $queryRaw: jest.fn(),
}));

describe("getHistoryHeadersData", () => {
  it("should return the correct counts for each indicator type", async () => {
    const mockUserId = "test-user-id";
    const mockDeckId = 1;

    const mockQueryResult = [
      { count: 5, indicatorType: "correct" },
      { count: 3, indicatorType: "incorrect" },
      { count: 7, indicatorType: "unanswered" },
      { count: 2, indicatorType: "unrevealed" },
    ];

    (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockQueryResult);

    const result = await getHistoryHeadersData(mockUserId, mockDeckId);

    expect(result).toEqual({
      correctCount: 5,
      incorrectCount: 3,
      unansweredCount: 7,
      unrevealedCount: 2,
    });
  });

  it("should return the correct counts for each indicator type if some of them is not returned from query", async () => {
    const mockUserId = "test-user-id";
    const mockDeckId = 1;

    const mockQueryResult = [
      { count: 5, indicatorType: "correct" },
      { count: 3, indicatorType: "incorrect" },
      { count: 7, indicatorType: "unanswered" },
    ];

    (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockQueryResult);

    const result = await getHistoryHeadersData(mockUserId, mockDeckId);

    expect(result).toEqual({
      correctCount: 5,
      incorrectCount: 3,
      unansweredCount: 7,
      unrevealedCount: 0,
    });
  });
});
