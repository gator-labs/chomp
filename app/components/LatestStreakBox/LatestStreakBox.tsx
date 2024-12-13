"use client";

import { HOME_STAT_CARD_TYPE } from "@/app/constants/tracking";
import MysteryBox from "@/components/MysteryBox/MysteryBox";
import { cn } from "@/lib/utils";
import { Goal } from "lucide-react";
import { useEffect, useState } from "react";

import StatsDrawer from "../StatsDrawer/StatsDrawer";

type LatestStreakBoxProps = {
  latestStreak: number;
  mysteryBoxId?: string | null;
};

const LatestStreakBox = ({
  latestStreak,
  mysteryBoxId,
}: LatestStreakBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mysteryBoxClosed, setMysteryBoxClosed] = useState<boolean>(false);

  useEffect(() => {
    setMysteryBoxClosed(false);
  }, [mysteryBoxId]);

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
        <p className="text-[44px] leading-[60px] font-bold">{latestStreak}</p>
        <div className="flex-1 flex-col flex gap-1">
          <div className="flex justify-between">
            <p className="text-base leading-[18px] font-bold">
              day{latestStreak === 1 ? "" : "s"} streak
            </p>
            <Goal width={20} height={20} />
          </div>
          <p
            className={cn("text-xs leading-4", {
              "text-destructive": latestStreak === 0,
              "text-purple-200": latestStreak > 0,
            })}
          >
            {latestStreak === 0
              ? "It's never too late to start"
              : "Great job! Keep going!"}
          </p>
        </div>
      </div>
      <StatsDrawer
        isOpen={isOpen && (!mysteryBoxId || mysteryBoxClosed)}
        onClose={() => setIsOpen(false)}
        title="Streak"
        description="Keep going! Streaks track consecutive days you've answered or
          revealed. How long can you keep it up?"
        type={
          HOME_STAT_CARD_TYPE.CARDS_REVEALED as keyof typeof HOME_STAT_CARD_TYPE
        }
      />
      {mysteryBoxId && !mysteryBoxClosed && (
        <MysteryBox
          isOpen={isOpen}
          closeBoxDialog={() => {
            setIsOpen(false);
            setMysteryBoxClosed(true);
          }}
          mysteryBoxId={mysteryBoxId}
          isDismissed={false}
        />
      )}
    </>
  );
};

export default LatestStreakBox;
