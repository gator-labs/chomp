import { getTotalNumberOfAnswersInDeck } from "@/app/actions/deck/deck";

export async function GET(request: Request) {
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
