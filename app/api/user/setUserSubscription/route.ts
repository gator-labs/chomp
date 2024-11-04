/**
 * API route to manage user's bot notification subscription status
 *
 * @route POST /api/user/setUserSubscription
 * @security Requires BOT_API_KEY in headers
 *
 * @param {Request} request - Contains:
 *   @param {string} telegramAuthToken - User's Telegram Payload
 *   @param {boolean} isBotSubscriber - New subscription status
 *
 * @returns {Response}
 *   - 200: Subscription status updated successfully
 *   - 400: Invalid API key
 *   - 500: Server error while updating subscription
 */
import verifyTelegramAuthToken from "@/app/actions/bot";
import { TelegramAuthDataProps } from "@/app/bot/page";
import prisma from "@/app/services/prisma";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const headersList = headers();
  const apiKey = headersList.get("api-key");

  if (apiKey !== process.env.BOT_API_KEY) {
    return new Response(`Invalid api-key`, {
      status: 400,
    });
  }

  const data = await request.json();
  const { telegramAuthToken, isBotSubscriber } = data;

  try {
    const telegramUserData = (await verifyTelegramAuthToken(
      telegramAuthToken,
    )) as TelegramAuthDataProps;
    const user = await prisma.user.findFirst({
      where: { telegramId: telegramUserData.id },
      select: {
        id: true,
      },
    });

    await prisma.user.update({
      where: { telegramId: telegramUserData.id, id: user?.id },
      data: { isBotSubscriber },
    });
    return Response.json({ message: "User subscription updated successfully" });
  } catch {
    return new Response(`Error setting subscriber`, {
      status: 500,
    });
  }
}
