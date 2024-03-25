import { getQuestions } from "@/app/queries/question";
import { QuestionList } from "@/app/components/QuestionList/QuestionList";

export default async function Page() {
  const questions = await getQuestions();

  return <QuestionList questions={questions} />;
}
