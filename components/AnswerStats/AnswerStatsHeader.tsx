"use client";

import BackButton from "@/app/components/BackButton/BackButton";
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

  const handleInfoIconClick = () => {
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex">
        <BackButton />
        <div className="bg-white text-black font-bold p-2 rounded-lg">
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
