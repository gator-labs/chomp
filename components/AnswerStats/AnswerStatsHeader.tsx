"use client";

import { ChevronLeftIcon } from "@/app/components/Icons/ChevronLeftIcon";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AnswerRewards } from "./AnswerRewards";
import UnderstandYourResultsDrawer from "./UnderstandYourResultsDrawer";

export type AnswerStatsHeaderProps = {
  title: string;
  bonkReward: string;
  creditsReward: string;
};

export function AnswerStatsHeader({
  title,
  bonkReward,
  creditsReward,
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
      <AnswerRewards
        bonkReward={bonkReward}
        creditsReward={creditsReward}
        isPracticeQuestion={false}
        isCorrect={true}
        variant="filled"
        onInfoIconClick={handleInfoIconClick}
      />
      <AnswerRewards
        bonkReward={bonkReward}
        creditsReward={creditsReward}
        isPracticeQuestion={false}
        isCorrect={false}
        variant="filled"
        onInfoIconClick={handleInfoIconClick}
      />
      <AnswerRewards
        bonkReward={bonkReward}
        creditsReward={creditsReward}
        isPracticeQuestion={true}
        isCorrect={true}
        variant="filled"
        onInfoIconClick={handleInfoIconClick}
      />
      <AnswerRewards
        bonkReward={bonkReward}
        creditsReward={creditsReward}
        isPracticeQuestion={true}
        isCorrect={false}
        variant="filled"
        onInfoIconClick={handleInfoIconClick}
      />
      <UnderstandYourResultsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
