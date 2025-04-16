"use client";

import { ChevronLeftIcon } from "@/app/components/Icons/ChevronLeftIcon";
import { RewardStatus } from "@/types/answerStats";
import { useState } from "react";

import { AnswerRewards } from "./AnswerRewards";
import { NoAnswerRewards } from "./NoAnswerRewards";
import UnderstandYourResultsDrawer from "./UnderstandYourResultsDrawer";

export type AnswerStatsHeaderProps = {
  title: string;
  deckId: number | null;
  isPracticeQuestion: boolean;
  isCorrect: boolean;
  bonkReward: string;
  creditsReward: string;
  rewardStatus: RewardStatus;
};

export function AnswerStatsHeader({
  title,
  deckId,
  isPracticeQuestion,
  isCorrect,
  bonkReward,
  creditsReward,
  rewardStatus,
}: AnswerStatsHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const handleInfoIconClick = () => {
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <a
          href={deckId ? `/application/decks/${deckId}` : "/application"}
          className="m-2 cursor-pointer"
        >
          <ChevronLeftIcon width={22} height={22} />
        </a>
        <div className="bg-chomp-blue-light text-black text-sm font-bold px-3 py-2 rounded-sm">
          {title}
        </div>
      </div>
      {(rewardStatus === "claimed" || isPracticeQuestion) && (
        <AnswerRewards
          bonkReward={bonkReward}
          creditsReward={creditsReward}
          isPracticeQuestion={isPracticeQuestion}
          isCorrect={isCorrect}
          variant="filled"
          onInfoIconClick={handleInfoIconClick}
        />
      )}
      {rewardStatus === "claimable" && !isPracticeQuestion && (
        <NoAnswerRewards />
      )}
      <UnderstandYourResultsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
