/**
 * API route to create a new user account using Telegram authentication data
 *
 * @route POST /api/user/createUserByTelegramId
 * @security Requires BOT_API_KEY in headers
 *
 * @param {Request} request - Contains:
 *   @param {string} telegramAuthToken - Telegram authentication token containing user data
 *
 * @returns {Response} JSON response containing:
 *   - 200: { profile: {
 *       id: string,
 *       isAdmin: boolean,
 *       telegramId: string,
 *       telegramUsername: string,
 *       isBotSubscriber: boolean,
 *       username: string,
 *       wallets: Wallet[]
 *     }}
 *   - 400: Invalid API key or missing telegram payload
 *   - 500: Error during user creation
 *
 * @description
 * Creates a new user account using verified Telegram authenticated data.
 * Generates a UUID for the user and sets initial bot subscription status.
 */
import verifyTelegramAuthToken from "@/app/actions/bot";
import { TelegramAuthDataProps } from "@/app/bot/page";
import prisma from "@/app/services/prisma";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const headersList = headers();
  const apiKey = headersList.get("api-key");

  if (apiKey !== process.env.BOT_API_KEY) {
    return new Response(`Invalid api-key`, {
      status: 400,
    });
  }

  const data = await request.json();
  const { telegramAuthToken } = data;

  if (!telegramAuthToken) {
    return Response.json("Telegram payload is required", {
      status: 400,
    });
  }

  const randomUUID = uuidv4();

  try {
    const telegramUserData = (await verifyTelegramAuthToken(
      telegramAuthToken,
    )) as TelegramAuthDataProps;

    const profile = await prisma.user.create({
      data: {
        id: randomUUID,
        telegramId: telegramUserData.id,
        telegramUsername: telegramUserData.username,
        isBotSubscriber: true,
      },
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

    // Create a custom serializer function to handle BigInt
    const responseProfile = {
      id: profile.id,
      isAdmin: profile.isAdmin,
      telegramId: profile.telegramId ? profile.telegramId.toString() : null,
      telegramUsername: profile.telegramUsername,
      isBotSubscriber: profile.isBotSubscriber,
      username: profile.username,
      wallets: profile.wallets,
    };

    return Response.json({ profile: responseProfile });
  } catch {
    return new Response(`Error creating user`, {
      status: 500,
    });
  }
}
