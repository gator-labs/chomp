"use client";

import { cn } from "@/lib/utils";
import { Goal } from "lucide-react";
import { useState } from "react";
import StreakInfoDrawer from "../StreakInfoDrawer/StreakInfoDrawer";

type LongestStreakBoxProps = {
  longestStreak: number;
};

const LongestStreakBox = ({ longestStreak }: LongestStreakBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => setIsOpen(false);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="w-full rounded-[8px] border-[0.5px] border-solid p-4 border-gray-500 bg-gray-700 flex gap-4 items-center"
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
      <StreakInfoDrawer isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default LongestStreakBox;
