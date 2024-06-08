import { getDailyDeckForFrame } from "@chomp/app/queries/deck";
import { getRandomElement } from "@chomp/app/utils/randomUtils";
import { headers } from "next/headers";

export async function GET() {
  const headersList = headers();
  const apiKey = headersList.get("api-key");

  if (apiKey !== process.env.FRAMES_API_KEY) {
    return new Response(`Invalid api-key`, {
      status: 400,
    });
  }

  const deck = await getDailyDeckForFrame();
  const { questions } = deck;
  if (questions.length === 0)
    new Response(`No questions found to load`, {
      status: 400,
    });

  const question = getRandomElement(questions);
  return Response.json({ question });
}
