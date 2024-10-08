"use client";

import { HOME_STAT_CARD_TYPE } from "@/app/constants/tracking";
import { cn } from "@/lib/utils";
import { Goal } from "lucide-react";
import { useState } from "react";
import StatsDrawer from "../StatsDrawer/StatsDrawer";

type LongestStreakBoxProps = {
  longestStreak: number;
};

const LongestStreakBox = ({ longestStreak }: LongestStreakBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full rounded-[8px] border-[0.5px] border-solid p-4 border-gray-500 bg-gray-700 flex gap-4 items-center transition-all duration-200 hover:bg-gray-600 cursor-pointer",
          {
            "bg-gray-600": isOpen,
          },
        )}
      >
        <p className="text-[44px] leading-[60px] font-bold">{longestStreak}</p>
        <div className="flex-1 flex-col flex gap-1">
          <div className="flex justify-between">
            <p className="text-base leading-[18px] font-bold">
              day{longestStreak === 1 ? "" : "s"} streak
            </p>
            <Goal width={20} height={20} />
          </div>
          <p
            className={cn("text-xs leading-4", {
              "text-destructive": longestStreak === 0,
              "text-purple-200": longestStreak > 0,
            })}
          >
            {longestStreak === 0
              ? "It's never too late to start"
              : "Great job! Keep going!"}
          </p>
        </div>
      </div>
      <StatsDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Streak"
        description="Keep going! Streaks track consecutive days you've answered or
          revealed. How long can you keep it up?"
        type={
          HOME_STAT_CARD_TYPE.CARDS_REVEALED as keyof typeof HOME_STAT_CARD_TYPE
        }
      />
    </>
  );
};

export default LongestStreakBox;
