import { getQuestionsNeedingCorrectAnswer } from "@/app/queries/answers";
import { calculateCorrectAnswer } from "@/app/utils/algo";

/**
 * Checks for questions whose revealDate has passed (or which have
 * revealAtAnswers satisfied) and calculates the correct answer for them,
 * recording the results in the database.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET || "";

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const questions = await getQuestionsNeedingCorrectAnswer();

    const questionIds = questions.map((q) => q.id);

    await calculateCorrectAnswer(questionIds);

    return new Response(
      JSON.stringify({
        message: "Processing completed",
        questionIds,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
