import { getTotalNumberOfAnswersInQuestions } from "@/app/actions/deck/deck";
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
