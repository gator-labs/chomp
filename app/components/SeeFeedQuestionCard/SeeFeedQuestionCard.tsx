"use client";

import { useRouter } from "next-nprogress-bar";
import { Button } from "../Button/Button";
import { FeedQuestionCard } from "../FeedQuestionCard/FeedQuestionCard";
import { OpenLinkIcon } from "../Icons/OpenLinkIcon";

type ClaimFeedQuestionCardProps = {
  id: number;
  question: string;
  revealAtDate?: Date;
  answerCount?: number;
  revealAtAnswerCount?: number;
};

export function SeeFeedQuestionCard({
  id,
  question,
  revealAtDate,
  answerCount,
  revealAtAnswerCount,
}: ClaimFeedQuestionCardProps) {
  const router = useRouter();

  const handleSeeAnswer = () => {
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
      onTopCornerAction={handleSeeAnswer}
      action={
        <Button onClick={handleSeeAnswer} variant="grayish">
          <div className="flex justify-center gap-1 items-center text-white">
            <div>See Answer</div>
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
