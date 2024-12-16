"use client";

import { revealQuestion } from "@/app/actions/chompResult";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { isSameURL } from "@/app/utils/isSameUrl";
import { RevealProps } from "@/types/reveal";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "../Button/Button";
import ChompFullScreenLoader from "../ChompFullScreenLoader/ChompFullScreenLoader";
import { FeedQuestionCard } from "../FeedQuestionCard/FeedQuestionCard";
import { ViewsIcon } from "../Icons/ViewsIcon";

type RevealFeedQuestionCardProps = {
  id: number;
  question: string;
  revealAtDate?: Date;
  answerCount?: number;
  revealAtAnswerCount?: number;
  revealTokenAmount?: number;
  image?: string;
};

export function RevealFeedQuestionCard({
  id,
  question,
  revealAtDate,
  answerCount,
  revealAtAnswerCount,
  revealTokenAmount,
  image,
}: RevealFeedQuestionCardProps) {
  const router = useRouter();
  const { openRevealModal } = useRevealedContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleReveal = () => {
    openRevealModal({
      // Data is passed from the useReveal hook, using reveal?.reveal(...data) for execution.
      reveal: async ({ burnTx, nftAddress, nftType }: RevealProps) => {
        await revealQuestion(id, burnTx, nftAddress, nftType);
        setIsLoading(true);
        const currentUrl = new URL(location.href);
        const targetUrl = new URL(
          "/application/answer/reveal/" + id,
          location.href,
        );
        const sameUrl = isSameURL(targetUrl, currentUrl);
        router.push("/application/answer/reveal/" + id);
        if (sameUrl) {
          setIsLoading(false);
        }
        router.refresh();
      },
      amount: revealTokenAmount ?? 0,
      questionId: id,
      questions: [question],
    });
  };

  return (
    <>
      <FeedQuestionCard
        question={question}
        answerCount={answerCount}
        image={image}
        revealAtAnswerCount={revealAtAnswerCount}
        revealAtDate={revealAtDate}
        statusLabel={
          <span className="text-xs leading-6 text-aqua">Chomped</span>
        }
        action={
          <Button onClick={handleReveal} variant="grayish">
            <div className="flex justify-center gap-1 items-center text-white">
              <div>Reveal</div>
              <ViewsIcon />
            </div>
          </Button>
        }
      />
      <ChompFullScreenLoader
        isLoading={isLoading}
        loadingMessage="Loading..."
      />
    </>
  );
}
