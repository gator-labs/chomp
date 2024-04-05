import { getUnansweredDailyQuestions } from "@/app/queries/question";
import { shuffleArray } from "@/app/utils/randomUtils";
import { redirect } from "next/navigation";

export default async function Page() {
  const unansweredQuestions = await getUnansweredDailyQuestions();

  const [randomQuestion] = shuffleArray(unansweredQuestions);

  if (randomQuestion) {
    redirect(`/application/answer/question/${randomQuestion.id}`);
  }

  return (
    <div className="flex justify-center items-center h-full">
      No questions available
    </div>
  );
}
