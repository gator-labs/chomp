import { createQuestion } from "@chomp/app/actions/question/question";
import QuestionForm from "@chomp/app/components/QuestionForm/QuestionForm";
import { getTags } from "@chomp/app/queries/tag";

export default async function Page() {
  const tags = await getTags();

  return <QuestionForm action={createQuestion} tags={tags} />;
}
