import { POST } from "@/app/api/user/setUserSubscription/route";
import prisma from "@/app/services/prisma";
import { encodeTelegramPayload } from "@/app/utils/testHelper";
import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

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
let testUserId: string;

jest.mock("next/headers", () => ({
  headers: () => new Map([["api-key", mockApiKey]]),
}));

describe("POST /api/user/setUserSubscription", () => {
  let mockRequest: NextRequest;

  // Create a test user before all tests
  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { telegramId: BigInt(TELEGRAM_USER_PAYLOAD.id) },
    });

    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        telegramId: BigInt(TELEGRAM_USER_PAYLOAD.id),
        isBotSubscriber: true,
      },
    });
    testUserId = user.id;
  });

  // Clean up test user after all tests
  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { telegramId: Number(TELEGRAM_USER_PAYLOAD.id) },
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiKey = VALID_API_KEY;
  });

  describe("subscription management", () => {
    it("should successfully unsubscribe a user", async () => {
      // Arrange
      const MOCK_TELEGRAM_AUTH_TOKEN = await encodeTelegramPayload(
        TELEGRAM_USER_PAYLOAD,
      );
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          telegramAuthToken: MOCK_TELEGRAM_AUTH_TOKEN,
          isBotSubscriber: false,
        }),
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      } as unknown as NextRequest;

      // Act
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.message).toBe("User subscription updated successfully");

      // Verify database state
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUserId },
      });
      expect(updatedUser?.isBotSubscriber).toBe(false);
    });

    it("should successfully resubscribe a user", async () => {
      // Arrange
      const MOCK_TELEGRAM_AUTH_TOKEN = await encodeTelegramPayload(
        TELEGRAM_USER_PAYLOAD,
      );
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          telegramAuthToken: MOCK_TELEGRAM_AUTH_TOKEN,
          isBotSubscriber: true,
        }),
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      } as unknown as NextRequest;

      // Act
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.message).toBe("User subscription updated successfully");

      // Verify database state
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUserId },
      });
      expect(updatedUser?.isBotSubscriber).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should return 400 with invalid API key", async () => {
      // Arrange
      mockApiKey = "invalid-api-key";
      const MOCK_TELEGRAM_AUTH_TOKEN = await encodeTelegramPayload(
        TELEGRAM_USER_PAYLOAD,
      );
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          telegramAuthToken: MOCK_TELEGRAM_AUTH_TOKEN,
          isBotSubscriber: true,
        }),
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      } as unknown as NextRequest;

      // Act
      const response = await POST(mockRequest);
      const errorMessage = await response.text();

      // Assert
      expect(response.status).toBe(400);
      expect(errorMessage).toBe("Invalid api-key");

      // Verify database state hasn't changed
      const unchangedUser = await prisma.user.findUnique({
        where: { id: testUserId },
      });
      expect(unchangedUser?.isBotSubscriber).toBe(true);
    });

    it("should return 500 when telegram verification fails", async () => {
      // Arrange
      const MOCK_TELEGRAM_AUTH_TOKEN = "invalid-token";
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          telegramAuthToken: MOCK_TELEGRAM_AUTH_TOKEN,
          isBotSubscriber: true,
        }),
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      } as unknown as NextRequest;

      // Act
      const response = await POST(mockRequest);
      const errorMessage = await response.text();

      // Assert
      expect(response.status).toBe(500);
      expect(errorMessage).toBe("Error setting subscriber");
    });
  });
});
