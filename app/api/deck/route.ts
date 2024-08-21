import { getTotalNumberOfAnswersInDeck } from "@/app/actions/deck/deck";
import { getIsUserAdmin } from "@/app/queries/user";

export async function GET(request: Request) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    return new Response(
      JSON.stringify({
        error: "You are not authorized to perform this action.",
      }),
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const deckId = Number(url.searchParams.get("deckId"));

  if (isNaN(deckId)) {
    return new Response(
      JSON.stringify({ error: "Invalid or missing deckId parameter" }),
      { status: 400 },
    );
  }

  const totalNumberOfAnswersInDeck =
    await getTotalNumberOfAnswersInDeck(deckId);

  return new Response(JSON.stringify({ totalNumberOfAnswersInDeck }), {
    headers: { "Content-Type": "application/json" },
  });
}
