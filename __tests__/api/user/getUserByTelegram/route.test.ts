import verifyTelegramAuthToken from "@/app/actions/bot";
import { GET } from "@/app/api/user/getUserByTelegram/route";
import prisma from "@/app/services/prisma";

// Constants
const VALID_API_KEY = process.env.BOT_API_KEY;
const BASE_URL = 'http://mock.example';
const MOCK_TELEGRAM_AUTH_TOKEN = "valid-auth-token";
const TELEGRAM_USER_PAYLOAD = {
  id: "705689",
  first_name: "John",
  last_name: "Doe",
  username: "john_doe",
  photo_url: "",
  auth_date: String(Math.floor(new Date().getTime())),
};
const MOCK_USER_PROFILE = {
  id: "user1",
  isAdmin: false,
  telegramId: "705689",
  isBotSubscriber: true,
  username: "john_doe",
  wallets: [],
};

// Mock setup
let mockApiKey = VALID_API_KEY;
const mockUrl = `${BASE_URL}/api/user/getUserByTelegramId?telegramAuthToken=${MOCK_TELEGRAM_AUTH_TOKEN}`;

jest.mock("next/headers", () => ({
  headers: () => new Map([["api-key", mockApiKey]]),
}));

jest.mock("@/app/actions/bot", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/app/services/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findFirst: jest.fn(),
    },
  },
}));

describe("GET /api/user/getUserByTelegramId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiKey = VALID_API_KEY;
  });

  describe("when all parameters are valid", () => {
    it("should return user profile with 200 status", async () => {
      // Arrange
      (verifyTelegramAuthToken as jest.Mock).mockResolvedValueOnce(
        TELEGRAM_USER_PAYLOAD,
      );
      (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(
        MOCK_USER_PROFILE,
      );

      // Act
      const response = await GET(new Request(mockUrl));
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ profile: MOCK_USER_PROFILE });
      expect(verifyTelegramAuthToken).toHaveBeenCalledWith(
        MOCK_TELEGRAM_AUTH_TOKEN,
      );
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { telegramId: TELEGRAM_USER_PAYLOAD.id },
        select: {
          id: true,
          isAdmin: true,
          telegramId: true,
          telegramUsername: true,
          isBotSubscriber: true,
          username: true,
          wallets: true,
        },
      });
    });
  });

  describe("when API key is invalid", () => {
    it("should return 400 with error message", async () => {
      // Arrange
      mockApiKey = "invalid-api-key";

      // Act
      const response = await GET(new Request(mockUrl));
      const errorMessage = await response.text();

      // Assert
      expect(response.status).toBe(400);
      expect(errorMessage).toBe("Invalid api-key");
      expect(verifyTelegramAuthToken).not.toHaveBeenCalled();
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });
  });

  describe("when telegram auth token is missing", () => {
    it("should return 400 with error message", async () => {
      // Arrange
      const urlWithoutToken = `${BASE_URL}/api/user/getUserByTelegramId`;

      // Act
      const response = await GET(new Request(urlWithoutToken));
      const errorMessage = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(errorMessage).toBe("Telegram payload is required");
      expect(verifyTelegramAuthToken).not.toHaveBeenCalled();
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });
  });

  describe("when telegram token verification fails", () => {
    it("should return 500 with error message", async () => {
      // Arrange
      (verifyTelegramAuthToken as jest.Mock).mockRejectedValueOnce(
        new Error("Invalid token"),
      );

      // Act
      const response = await GET(new Request(mockUrl));
      const errorMessage = await response.text();

      // Assert
      expect(response.status).toBe(500);
      expect(errorMessage).toBe("Error fetching user profile");
      expect(verifyTelegramAuthToken).toHaveBeenCalledTimes(1);
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });
  });

  describe("when database operation fails", () => {
    it("should return 500 with error message", async () => {
      // Arrange
      (verifyTelegramAuthToken as jest.Mock).mockResolvedValueOnce(
        TELEGRAM_USER_PAYLOAD,
      );
      (prisma.user.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("Database error"),
      );

      // Act
      const response = await GET(new Request(mockUrl));
      const errorMessage = await response.text();

      // Assert
      expect(response.status).toBe(500);
      expect(errorMessage).toBe("Error fetching user profile");
      expect(verifyTelegramAuthToken).toHaveBeenCalledTimes(1);
      expect(prisma.user.findFirst).toHaveBeenCalledTimes(1);
    });
  });
});
