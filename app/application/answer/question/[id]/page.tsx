import { Question } from "@/app/components/Question/Question";
import {
  getQuestionForAnswerById,
  hasAnsweredQuestion,
} from "@/app/queries/question";
import { getCurrentUser } from "@/app/queries/user";
import dayjs from "dayjs";
import { redirect } from "next/navigation";

type PageProps = {
  params: { id: string };
};

export default async function Page({ params: { id } }: PageProps) {
  const hasAnswered = await hasAnsweredQuestion(+id);
  const user = await getCurrentUser();

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
    <div className="h-full py-2">
      {question && (
        <Question
          question={question}
          user={{
            id: user?.id || "",
            username: user?.username || "",
            address: user?.wallets[0].address || "",
          }}
          returnUrl="/application"
        />
      )}
    </div>
  );
}
