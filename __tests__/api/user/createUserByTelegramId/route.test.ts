import { POST } from "@/app/api/user/createUserByTelegramId/route";
import prisma from "@/app/services/prisma";
import * as nodeCrypto from "crypto";
import * as jwt from "jsonwebtoken";

// Constants
const VALID_API_KEY = process.env.BOT_API_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN ?? "";
const BASE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/user/createUserByTelegramId`
  : "http://localhost:3000/api/user/createUserByTelegramId";
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiKey = VALID_API_KEY;
  });

  // Cleanup after each test
  afterEach(async () => {
    if (createdUserId) {
      await prisma.user.delete({
        where: { id: createdUserId },
      });
      createdUserId = "";
    }
  });

  describe("when all parameters are valid", () => {
    it("should create new user and return profile with 200 status", async () => {
      // Arrange
      const MOCK_TELEGRAM_AUTH_TOKEN = await encodeTelegramPayload(
        TELEGRAM_USER_PAYLOAD,
      );
      const request = new Request(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ telegramAuthToken: MOCK_TELEGRAM_AUTH_TOKEN }),
      });

      // Act
      const response = await POST(request);
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
    });
  });

  describe("when telegram auth token is missing", () => {
    it("should return 400 with error message", async () => {
      // Arrange
      const request = new Request(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      // Act
      const response = await POST(request);
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
      const request = new Request(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ telegramAuthToken: MOCK_TELEGRAM_AUTH_TOKEN }),
      });

      // Act
      const response = await POST(request);
      const errorMessage = await response.text();

      // Assert
      expect(response.status).toBe(500);
      expect(errorMessage).toBe("Error creating user");
    });
  });
});

// Helper function to encode the Telegram payload
export async function encodeTelegramPayload(TELEGRAM_USER_PAYLOAD: any) {
  // Filter out undefined or empty values from the data object
  const filteredUseData = Object.entries(TELEGRAM_USER_PAYLOAD).reduce(
    (acc: { [key: string]: any }, [key, value]) => {
      if (value) acc[key] = value;
      return acc;
    },
    {} as { [key: string]: any },
  );

  // Sort the entries and create the data check string
  const dataCheckArr = Object.entries(filteredUseData)
    .map(([key, value]) => `${key}=${String(value)}`)
    .sort((a, b) => a.localeCompare(b))
    .join("\n");

  // Create SHA-256 hash from the bot token
  const TELEGRAM_SECRET = nodeCrypto
    .createHash("sha256")
    .update(BOT_TOKEN)
    .digest();

  // Generate HMAC-SHA256 hash from the data check string
  const hash = nodeCrypto
    .createHmac("sha256", new Uint8Array(TELEGRAM_SECRET))
    .update(dataCheckArr)
    .digest("hex");

  // Create JWT with user data and hash
  const telegramAuthToken = jwt.sign(
    {
      ...TELEGRAM_USER_PAYLOAD,
      hash,
    },
    BOT_TOKEN, // Use the bot token to sign the JWT
    { algorithm: "HS256" },
  );

  return encodeURIComponent(telegramAuthToken);
}
