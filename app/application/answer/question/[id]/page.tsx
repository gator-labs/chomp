import { Deck } from "@/app/components/Deck/Deck";
import { Question } from "@/app/components/Question/Question";
import { getQuestionForAnswerById } from "@/app/queries/question";

type PageProps = {
  params: { id: string };
};

export default async function Page({ params: { id } }: PageProps) {
  const question = await getQuestionForAnswerById(+id);

  return (
    <div className="h-full p-2">
      {question && <Question question={question} returnUrl="/application" />}
    </div>
  );
}
