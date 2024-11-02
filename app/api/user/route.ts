/*
  THIS ROUTE CONTAINS TWO METHODS GET AND POST: 
  ➤ GET METHOD: FETCHES USER BY TELEGRAM ID
  ➤ POST METHOD: CREATES A USER BY TELEGRAM ID
*/
import prisma from "@/app/services/prisma";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

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
  const telegramId = searchParams.get("telegramId");

  if (!telegramId || Array.isArray(telegramId)) {
    return Response.json("telegramId parameter is required", { status: 400 });
  }

  try {
    const profile = await prisma.user.findFirst({
      where: {
        telegramId: Number(telegramId),
      },
      select: {
        id: true,
        isAdmin: true,
        telegramId: true,
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

export async function POST(request: Request) {
  const headersList = headers();
  const apiKey = headersList.get("api-key");

  if (apiKey !== process.env.BOT_API_KEY) {
    return new Response(`Invalid api-key`, {
      status: 400,
    });
  }

  const data = await request.json();
  const { telegramId } = data;

  if (!telegramId) {
    return Response.json("telegramId parameter is required", { status: 400 });
  }

  const randomUUID = uuidv4();

  try {
    const profile = await prisma.user.create({
      data: {
        id: randomUUID,
        telegramId: telegramId,
        isBotSubscriber: true,
      },
      select: {
        id: true,
        isAdmin: true,
        telegramId: true,
        isBotSubscriber: true,
        username: true,
        wallets: true,
      },
    });

    return Response.json({ profile });
  } catch {
    return new Response(`Error creating user`, {
      status: 500,
    });
  }
}
