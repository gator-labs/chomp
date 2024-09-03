"use client";

import { useRouter } from "next-nprogress-bar";
import { Button } from "../Button/Button";
import { FeedQuestionCard } from "../FeedQuestionCard/FeedQuestionCard";
import { MoneyIcon } from "../Icons/MoneyIcon";
import { OpenLinkIcon } from "../Icons/OpenLinkIcon";

type ClaimFeedQuestionCardProps = {
  id: number;
  question: string;
  revealAtDate?: Date;
  answerCount?: number;
  revealAtAnswerCount?: number;
};

export function ClaimFeedQuestionCard({
  id,
  question,
  revealAtDate,
  answerCount,
  revealAtAnswerCount,
}: ClaimFeedQuestionCardProps) {
  const router = useRouter();

  const handleClaim = () => {
    router.push("/application/answer/reveal/" + id);
    router.refresh();
  };

  return (
    <FeedQuestionCard
      question={question}
      answerCount={answerCount}
      revealAtAnswerCount={revealAtAnswerCount}
      revealAtDate={revealAtDate}
      statusLabel={
        <span className="text-xs leading-6 text-aqua">Revealed</span>
      }
      onTopCornerAction={handleClaim}
      action={
        <Button onClick={handleClaim} variant="grayish">
          <div className="flex justify-center gap-1 items-center text-grey-0">
            <div>Claim</div>
            <MoneyIcon />
          </div>
        </Button>
      }
      topCornerActionIcon={
        <div>
          <OpenLinkIcon />
        </div>
      }
    />
  );
}
