"use client";

import { ChevronLeftIcon } from "@/app/components/Icons/ChevronLeftIcon";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AnswerRewards } from "./AnswerRewards";
import UnderstandYourResultsDrawer from "./UnderstandYourResultsDrawer";

export type AnswerStatsHeaderProps = {
  title: string;
  isPracticeQuestion: boolean;
  isCorrect: boolean;
  bonkReward: string;
  creditsReward: string;
  isRewardKnown: boolean;
};

export function AnswerStatsHeader({
  title,
  isPracticeQuestion,
  isCorrect,
  bonkReward,
  creditsReward,
  isRewardKnown,
}: AnswerStatsHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const router = useRouter();

  const handleInfoIconClick = () => {
    setIsDrawerOpen(true);
  };

  const handleBackClick = () => {
    router.refresh();
    router.back();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div onClick={handleBackClick} className="m-2 cursor-pointer">
          <ChevronLeftIcon width={22} height={22} />
        </div>
        <div className="bg-chomp-blue-light text-black font-bold px-4 py-2 rounded-sm">
          {title}
        </div>
      </div>
      { isRewardKnown && <AnswerRewards
        bonkReward={bonkReward}
        creditsReward={creditsReward}
        isPracticeQuestion={isPracticeQuestion}
        isCorrect={isCorrect}
        variant="filled"
        onInfoIconClick={handleInfoIconClick}
      />}
      <UnderstandYourResultsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
