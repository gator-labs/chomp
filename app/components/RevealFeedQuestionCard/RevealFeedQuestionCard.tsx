"use client";

import { Button } from "../Button/Button";
import { FeedQuestionCard } from "../FeedQuestionCard/FeedQuestionCard";
import { ViewsIcon } from "../Icons/ViewsIcon";

import { revealQuestion } from "@/app/actions/chompResult";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { useRouter } from "next-nprogress-bar";

type RevealFeedQuestionCardProps = {
  id: number;
  question: string;
  revealAtDate?: Date;
  answerCount?: number;
  revealAtAnswerCount?: number;
  revealTokenAmount?: number;
};

export function RevealFeedQuestionCard({
  id,
  question,
  revealAtDate,
  answerCount,
  revealAtAnswerCount,
  revealTokenAmount,
}: RevealFeedQuestionCardProps) {
  const router = useRouter();
  const { openRevealModal } = useRevealedContext();

  const handleReveal = () => {
    openRevealModal(
      async (burnTx?: string, nftAddress?: string) => {
        await revealQuestion(id, burnTx, nftAddress);
        router.push("/application/answer/reveal/" + id);
        router.refresh();
      },
      revealTokenAmount ?? 0,
      id,
    );
  };

  return (
    <FeedQuestionCard
      question={question}
      answerCount={answerCount}
      revealAtAnswerCount={revealAtAnswerCount}
      revealAtDate={revealAtDate}
      statusLabel={<span className="text-xs leading-6 text-aqua">Chomped</span>}
      action={
        <Button onClick={handleReveal} variant="grayish">
          <div className="flex justify-center gap-1 items-center text-white">
            <div>Reveal</div>
            <ViewsIcon />
          </div>
        </Button>
      }
    />
  );
}
