import { Question } from "@/app/components/Question/Question";
import {
  getQuestionForAnswerById,
  hasAnsweredQuestion,
} from "@/app/queries/question";
import dayjs from "dayjs";
import { redirect } from "next/navigation";

type PageProps = {
  params: { id: string };
};

export default async function Page({ params: { id } }: PageProps) {
  const hasAnswered = await hasAnsweredQuestion(+id);

  if (hasAnswered) {
    return redirect("/application");
  }

  const question = await getQuestionForAnswerById(+id);

  if (
    question?.revealAtDate !== null &&
    dayjs(question?.revealAtDate).isBefore(new Date())
  ) {
    return redirect("/application");
  }

  return (
    <div className="h-full px-4 py-2">
      {question && <Question question={question} returnUrl="/application" />}
    </div>
  );
}
