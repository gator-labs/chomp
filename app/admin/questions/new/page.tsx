import { createQuestion } from "@/app/actions/question";
import QuestionForm from "@/app/components/QuestionForm/QuestionForm";

export default async function Page() {
  return <QuestionForm action={createQuestion} />;
}
