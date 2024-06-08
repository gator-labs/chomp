import { editQuestion } from "@chomp/app/actions/question/question";
import QuestionForm from "@chomp/app/components/QuestionForm/QuestionForm";
import { getQuestionSchema } from "@chomp/app/queries/question";
import { getTags } from "@chomp/app/queries/tag";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function Page({ params: { id } }: PageProps) {
  const question = await getQuestionSchema(+id);
  const tags = await getTags();

  if (!question) {
    return notFound();
  }

  return <QuestionForm action={editQuestion} question={question} tags={tags} />;
}
