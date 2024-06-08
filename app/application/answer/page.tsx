import { NoQuestionsCard } from "@chomp/app/components/NoQuestionsCard/NoQuestionsCard";
import { getFirstUnansweredQuestion } from "@chomp/app/queries/question";
import { redirect } from "next/navigation";

export default async function Page() {
  const unansweredQuestion = await getFirstUnansweredQuestion();

  if (unansweredQuestion) {
    redirect(`/application/answer/question/${unansweredQuestion.id}`);
  }

  return (
    <div className="flex justify-center items-center h-full">
      <NoQuestionsCard variant="answer-page" />
    </div>
  );
}
