import { GET } from "@/app/api/users/getSubscribedUsers/route";
import prisma from "@/app/services/prisma";

// Constants
const VALID_API_KEY = process.env.BOT_API_KEY;
const MOCK_USERS = [
  { id: 1, telegramId: "705289" },
  { id: 2, telegramId: "943108" },
] as const;

// Mock setup
let mockApiKey = VALID_API_KEY;

jest.mock("next/headers", () => ({
  headers: () => new Map([["api-key", mockApiKey]]),
}));

jest.mock("@/app/services/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
    },
  },
}));

describe("GET /api/users/getSubscribedUsers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiKey = VALID_API_KEY;
  });

  describe("when API key is valid", () => {
    it("should return subscribed users with 200 status", async () => {
      // Arrange
      (prisma.user.findMany as jest.Mock).mockResolvedValueOnce(MOCK_USERS);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ users: MOCK_USERS });
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { isBotSubscriber: true },
        select: { telegramId: true, id: true },
      });
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("when API key is invalid", () => {
    it("should return 400 with error message", async () => {
      // Arrange
      mockApiKey = "invalid-api-key";

      // Act
      const response = await GET();
      const errorMessage = await response.text();

      // Assert
      expect(response.status).toBe(400);
      expect(errorMessage).toBe("Invalid api-key");
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });
  });

  describe("when database operation fails", () => {
    it("should return 500 with error message", async () => {
      // Arrange
      (prisma.user.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("Database error"),
      );

      // Act
      const response = await GET();
      const errorMessage = await response.text();

      // Assert
      expect(response.status).toBe(500);
      expect(errorMessage).toBe("Error getting subscribed users");
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
