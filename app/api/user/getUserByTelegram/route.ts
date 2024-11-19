/**
 * API route to retrieve user profile data by Telegram ID
 *
 * @route GET /api/user/getUserByTelegram
 * @security Requires BOT_API_KEY in headers
 *
 * @param {Request} req - Contains:
 *   @param {string} telegramAuthToken - User's Telegram Payload
 *
 * @returns {Response} JSON response containing:
 *   - 200: { profile: {
 *       id: string,
 *       isAdmin: boolean,
 *       telegramId: number,
 *       telegramUsername: string,
 *       isBotSubscriber: boolean,
 *       username: string,
 *       wallets: Wallet[]
 *     }}
 *   - 400: Invalid API key or missing telegram payload
 *   - 500: Server error while fetching profile
 */
import verifyTelegramAuthToken from "@/app/actions/bot";
import { TelegramAuthDataProps } from "@/app/bot/page";
import prisma from "@/app/services/prisma";
import { headers } from "next/headers";

export async function GET(req: Request) {
  const headersList = headers();
  const apiKey = headersList.get("api-key");
  if (apiKey !== process.env.BOT_API_KEY) {
    // Validates API key for authentication
    return new Response(`Invalid api-key`, {
      status: 400,
    });
  }

  const { searchParams } = new URL(req.url);
  const telegramAuthToken = searchParams.get("telegramAuthToken");

  if (!telegramAuthToken) {
    return Response.json("Telegram payload is required", {
      status: 400,
    });
  }

  try {
    const telegramUserData = (await verifyTelegramAuthToken(
      telegramAuthToken,
    )) as TelegramAuthDataProps;

    const profile = await prisma.user.findFirst({
      where: {
        telegramId: telegramUserData.id,
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

    return Response.json({ profile });
  } catch {
    return new Response(`Error fetching user profile`, {
      status: 500,
    });
  }
}
