/*
  THIS ROUTE CONTAINS TWO METHODS GET AND POST: 
  ➤ GET METHOD: FETCHES USER PROFILE BY TELEGRAM ID
  ➤ POST METHOD: CREATE A TEMP USER PROFILE BY TELEGRAM ID
*/

import { getUserByTelegram, setUserByTelegram } from "@/app/queries/user";
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
  const telegramId = searchParams.get("telegramId");

  if (!telegramId || Array.isArray(telegramId)) {
    return Response.json("telegramId parameter is required", { status: 400 });
  }

  const profile = await getUserByTelegram(telegramId as string);

  if (!profile) {
    return Response.json("No data found", { status: 404 });
  }

  return Response.json({ profile });
}

export async function POST(req: Request) {
  const headersList = headers();
  const apiKey = headersList.get("api-key");
  if (apiKey !== process.env.BOT_API_KEY) {
    // Validates API key for authentication
    return new Response(`Invalid api-key`, {
      status: 400,
    });
  }

  const data = await req.json();
  const { id, telegramId } = data;
  const response = await setUserByTelegram({
    id,
    telegramId,
  });

  return Response.json(response);
}
