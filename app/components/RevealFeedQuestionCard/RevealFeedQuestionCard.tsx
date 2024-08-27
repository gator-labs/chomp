"use client";

import { useState } from "react";
import { RevealProps } from "@/app/hooks/useReveal";
import { Button } from "../Button/Button";
import { FeedQuestionCard } from "../FeedQuestionCard/FeedQuestionCard";
import { ViewsIcon } from "../Icons/ViewsIcon";
import { revealQuestion } from "@/app/actions/chompResult";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { useRouter } from "next/navigation"; import Spinner from "../Spinner/Spinner";
import ChompFullScreenLoader from "../ChompFullScreenLoader/ChompFullScreenLoader";
import { isSameURL } from "@/app/utils/isSameUrl";

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
      reveal: async ({ burnTx, nftAddress, nftType }: RevealProps) => {

        await revealQuestion(id, burnTx, nftAddress, nftType);
        setIsLoading(true);
        const currentUrl = new URL(location.href);
        const targetUrl = new URL("/application/answer/reveal/" + id, location.href);
        const sameUrl = isSameURL(targetUrl, currentUrl)
        router.push("/application/answer/reveal/" + id);
        if (sameUrl) {
          setIsLoading(false)
        }
        router.refresh();

      },
      amount: revealTokenAmount ?? 0,
      questionId: id,
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
      <ChompFullScreenLoader
        isLoading={isLoading}
        loadingMessage="Loading..."
      />
    </>
  );
}
