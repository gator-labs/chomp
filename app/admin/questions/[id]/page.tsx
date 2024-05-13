import { editQuestion } from "@/app/actions/question/question";
import QuestionForm from "@/app/components/QuestionForm/QuestionForm";
import { getQuestionSchema } from "@/app/queries/question";
import { getTags } from "@/app/queries/tag";
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
