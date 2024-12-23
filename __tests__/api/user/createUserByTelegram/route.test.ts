import { POST } from "@/app/api/user/createUserByTelegram/route";
import prisma from "@/app/services/prisma";
import { encodeTelegramPayload } from "@/app/utils/testHelper";
import { NextRequest } from "next/server";

// Constants
const VALID_API_KEY = process.env.BOT_API_KEY;

const TELEGRAM_USER_PAYLOAD = {
  id: "705689",
  first_name: "John",
  last_name: "",
  username: "john_doe",
  photo_url: "",
  auth_date: String(Math.floor(new Date().getTime())),
};

// Mock setup
let mockApiKey = VALID_API_KEY;

jest.mock("next/headers", () => ({
  headers: () => new Map([["api-key", mockApiKey]]),
}));

describe("POST /api/user/createUserByTelegramId", () => {
  let createdUserId: string;
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiKey = VALID_API_KEY;
  });

  // Cleanup after each test
  afterEach(async () => {
    try {
      // Clean up any test users by both ID and telegramId
      await prisma.user.deleteMany({
        where: {
          OR: [
            { id: createdUserId },
            { telegramId: BigInt(TELEGRAM_USER_PAYLOAD.id) },
          ],
        },
      });
    } catch (error) {
      console.error("Error cleaning up test users:", error);
    } finally {
      createdUserId = "";
    }
  });

  describe("when all parameters are valid", () => {
    it("should create new user and return profile with 200 status", async () => {
      // Arrange
      const MOCK_TELEGRAM_AUTH_TOKEN = await encodeTelegramPayload(
        TELEGRAM_USER_PAYLOAD,
      );
      mockRequest = {
        json: jest
          .fn()
          .mockResolvedValue({ telegramAuthToken: MOCK_TELEGRAM_AUTH_TOKEN }),
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      } as unknown as NextRequest;

      // Act
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.profile.id).toBeDefined();
      expect(data.profile.telegramId).toBe(TELEGRAM_USER_PAYLOAD.id);
      expect(data.profile.isBotSubscriber).toBe(true);
      expect(data.profile.wallets).toEqual([]);

      // Store ID for cleanup
      createdUserId = data.profile.id;

      // Verify user exists in database
      const dbUser = await prisma.user.findUnique({
        where: { id: createdUserId },
      });
      expect(dbUser).toBeDefined();
      expect(dbUser?.telegramId).toBe(BigInt(TELEGRAM_USER_PAYLOAD.id));
    });
  });

  describe("when telegram auth token is missing", () => {
    it("should return 400 with error message", async () => {
      // Arrange
      mockRequest = {
        json: jest.fn().mockResolvedValue({}),
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      } as unknown as NextRequest;

      // Act
      const response = await POST(mockRequest);
      const errorMessage = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(errorMessage).toBe("Telegram payload is required");
    });
  });

  describe("when telegram token verification fails", () => {
    it("should return 500 with error message", async () => {
      // Arrange
      const MOCK_TELEGRAM_AUTH_TOKEN = "invalid-token";
      mockRequest = {
        json: jest
          .fn()
          .mockResolvedValue({ telegramAuthToken: MOCK_TELEGRAM_AUTH_TOKEN }),
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      } as unknown as NextRequest;

      // Act
      const response = await POST(mockRequest);
      const errorMessage = await response.text();

      // Assert
      expect(response.status).toBe(500);
      expect(errorMessage).toBe("Error creating user");
    });
  });
});
