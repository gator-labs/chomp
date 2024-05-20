import { HalfArrowLeftIcon } from "@/app/components/Icons/HalfArrowLeftIcon";
import Trophy from "@/app/components/Icons/Trophy";
import { getQuestion } from "@/app/queries/question";
import { isEntityRevealable } from "@/app/utils/question";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface Props {
  params: {
    questionId: string;
  };
}

const RevealAnswerPage = async ({ params }: Props) => {
  const question = await getQuestion(Number(params.questionId));

  if (!question) notFound();

  const isQuestionRevealable = isEntityRevealable({
    revealAtAnswerCount: question.revealAtAnswerCount,
    revealAtDate: question.revealAtDate,
    answerCount: question.questionOptions[0].questionAnswers.length,
  });

  if (!isQuestionRevealable) redirect("/application");

  return (
    <div className="px-4 py-2 flex flex-col gap-4">
      <Link href="/application">
        <HalfArrowLeftIcon />
      </Link>
      <div className="p-4 flex bg-[#333333] rounded-md justify-between">
        <div className="flex flex-col gap-4 max-w-[210px] w-full justify-between">
          <p>Congrats, you won!</p>
          <div className="h-[1px] w-full bg-[#666666]" />
          <div className="flex items-center gap-1 justify-between">
            <p className="text-sm">Claim reward:</p>
            <div className="px-4 py-2 bg-white flex items-center justify-center rounded-3xl">
              <p className="text-xs text-[#0D0D0D] font-bold">300,000 BONK</p>
            </div>
          </div>
        </div>
        <Trophy width={70} height={85} />
      </div>
    </div>
  );
};

export default RevealAnswerPage;
