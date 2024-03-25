import { editQuestion } from "@/app/actions/question";
import QuestionForm from "@/app/components/QuestionForm/QuestionForm";
import { getQuestion } from "@/app/queries/question";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const question = await getQuestion(+params.id);

  if (!question) {
    return notFound();
  }

  return (
    <QuestionForm action={editQuestion} question={question} id={question.id} />
  );
}
