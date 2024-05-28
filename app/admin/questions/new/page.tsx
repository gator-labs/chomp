import { createQuestion } from "@/app/actions/question/question";
import QuestionForm from "@/app/components/QuestionForm/QuestionForm";
import { getTags } from "@/app/queries/tag";

export default async function Page() {
  const tags = await getTags();

  return <QuestionForm action={createQuestion} tags={tags} />;
}
