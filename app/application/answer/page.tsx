import { getUnansweredDailyQuestions } from "@/app/queries/question";
import { shuffleArray } from "@/app/utils/randomUtils";

export default async function Page() {
  const unansweredQuestions = await getUnansweredDailyQuestions();

  const [randomQuestion] = shuffleArray(unansweredQuestions);

  return <div>Answer2 page {unansweredQuestions.length}</div>;
}
