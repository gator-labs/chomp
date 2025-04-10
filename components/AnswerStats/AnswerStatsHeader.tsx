"use client";

import { ChevronLeftIcon } from "@/app/components/Icons/ChevronLeftIcon";
import { useState } from "react";

import { AnswerRewards } from "./AnswerRewards";
import UnderstandYourResultsDrawer from "./UnderstandYourResultsDrawer";

export type AnswerStatsHeaderProps = {
  title: string;
  deckId: number | null;
  isPracticeQuestion: boolean;
  isCorrect: boolean;
  bonkReward: string;
  creditsReward: string;
  isRewardKnown: boolean;
};

export function AnswerStatsHeader({
  title,
  deckId,
  isPracticeQuestion,
  isCorrect,
  bonkReward,
  creditsReward,
  isRewardKnown,
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
        <div className="bg-chomp-blue-light text-black font-bold px-4 py-2 rounded-sm">
          {title}
        </div>
      </div>
      {isRewardKnown && (
        <AnswerRewards
          bonkReward={bonkReward}
          creditsReward={creditsReward}
          isPracticeQuestion={isPracticeQuestion}
          isCorrect={isCorrect}
          variant="filled"
          onInfoIconClick={handleInfoIconClick}
        />
      )}
      <UnderstandYourResultsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
