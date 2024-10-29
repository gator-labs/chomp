/*
  THIS ROUTE CONTAINS TWO METHODS GET AND POST: 
  ➤ GET METHOD: FETCHES SUBSCRIBED USERS
  ➤ POST METHOD: SETS A USER AS SUBSCRIBER
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
        isSubscriber: true,
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

export async function POST(request: Request) {
  const headersList = headers();
  const apiKey = headersList.get("api-key");

  if (apiKey !== process.env.BOT_API_KEY) {
    return new Response(`Invalid api-key`, {
      status: 400,
    });
  }

  const data = await request.json();
  const { telegramId, userId, isSubscriber } = data;

  try {
    await prisma.user.update({
      where: { telegramId, id: userId },
      data: { isSubscriber },
    });
    const users = await prisma.user.findMany({
      where: {
        isSubscriber: true,
      },
      select: {
        telegramId: true,
        id: true,
      },
    });
    return Response.json({ users });
  } catch {
    return new Response(`Error setting subscriber`, {
      status: 500,
    });
  }
}
