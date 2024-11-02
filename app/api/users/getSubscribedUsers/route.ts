/**
 * GET /api/users/getSubscribedUsers
 *
 * Retrieves all users who have subscribed to bot notifications.
 *
 * @requires BOT_API_KEY - API key must be provided in request headers
 * @returns {Object} JSON containing array of subscribed users with their telegram IDs
 * @throws {400} If invalid or missing API key
 * @throws {500} If database operation fails
 */
import prisma from "@/app/services/prisma";
import { headers } from "next/headers";

export async function GET() {
  const headersList = headers();
  const apiKey = headersList.get("api-key");

  if (apiKey !== process.env.BOT_API_KEY) {
    return new Response(`Invalid api-key`, {
      status: 400,
    });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        isBotSubscriber: true,
      },
      select: {
        telegramId: true,
        id: true,
      },
    });

    return Response.json({ users });
  } catch {
    return new Response(`Error getting subscribed users`, {
      status: 500,
    });
  }
}
