import { getTotalNumberOfAnswersInQuestions } from "@/app/actions/deck/deck";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const questionId = Number(url.searchParams.get("questionId"));

  if (isNaN(questionId)) {
    return new Response(
      JSON.stringify({ error: "Invalid or missing questionId parameter" }),
      { status: 400 },
    );
  }

  const totalNumberOfAnswersInDeck =
    await getTotalNumberOfAnswersInQuestions(questionId);

  return new Response(JSON.stringify({ totalNumberOfAnswersInDeck }), {
    headers: { "Content-Type": "application/json" },
  });
}
