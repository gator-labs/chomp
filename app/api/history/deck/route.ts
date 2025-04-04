import { getJwtPayload } from "@/app/actions/jwt";
import { getHistoryDecks } from "@/lib/history/deck";
import { NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  pageParam: z.string().transform((val) => parseInt(val, 10)), // Convert to number
  showAnsweredDeck: z.string().transform((val) => val === "true"), // Convert to boolean
});

export async function GET(request: NextRequest) {
  const payload = await getJwtPayload();

  const userId = payload?.sub;

  let req;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    req = schema.parse(params);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 500,
    });
  }

  const pageParam = req.pageParam;
  const showAnsweredDeck = req.showAnsweredDeck;

  const history = await getHistoryDecks({
    userId,
    pageParam,
    showAnsweredDeck,
  });
  return new Response(
    JSON.stringify({
      history,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}
