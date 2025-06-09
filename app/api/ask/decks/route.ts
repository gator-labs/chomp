import { getJwtPayload } from "@/app/actions/jwt";
import { getIsUserAdmin } from "@/app/queries/user";
import { getCommunityAskDecks } from "@/lib/ask/getCommunityAskDecks";
import { type NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  const payload = await getJwtPayload();

  if (!payload?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    return new Response(
      JSON.stringify({
        error: "You are not authorized to perform this action.",
      }),
      { status: 403 },
    );
  }

  const decks = await getCommunityAskDecks();

  return new Response(
    JSON.stringify({
      decks,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}
