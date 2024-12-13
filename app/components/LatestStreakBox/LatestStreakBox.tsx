"use client";

import { HOME_STAT_CARD_TYPE } from "@/app/constants/tracking";
import MysteryBox from "@/components/MysteryBox/MysteryBox";
import { cn } from "@/lib/utils";
import { CalendarCheckIcon } from "lucide-react";
import { useEffect, useState } from "react";

import AnimatedGradientBorder from "../AnimatedGradientBorder";
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

  if (
    !!mysteryBoxId &&
    latestStreak >= Number(process.env.NEXT_PUBLIC_CHOMPMAS_MIN_STREAK!)
  )
    return (
      <>
        <AnimatedGradientBorder
          onClick={() => setIsOpen(true)}
          className="w-full rounded-[8px] bg-gray-800 flex flex-col gap-0 transition-all duration-200 hover:bg-gray-700 cursor-pointer"
        >
          <div className="flex justify-between items-center basis-full w-full">
            <p
              className={cn("font-bold", {
                "text-destructive": latestStreak === 0,
                "text-secondary": latestStreak > 0,
              })}
            >
              {latestStreak} Day{latestStreak === 1 ? "" : "s"} Streak
            </p>

            <CalendarCheckIcon width={25} height={25} />
          </div>
          <p className="text-sm text-green font-medium w-full">
            Claim your <br /> CHOMPmas box
          </p>
        </AnimatedGradientBorder>

        {!mysteryBoxClosed && (
          <MysteryBox
            isOpen={isOpen}
            closeBoxDialog={() => {
              setIsOpen(false);
              setMysteryBoxClosed(true);
            }}
            mysteryBoxId={mysteryBoxId}
          />
        )}
      </>
    );

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full rounded-[8px] border-[0.5px] border-solid p-4 border-gray-600 bg-gray-800 flex flex-col gap-2 transition-all duration-200 hover:bg-gray-700 cursor-pointer",
          {
            "bg-gray-600": isOpen,
          },
        )}
      >
        <div className="flex justify-between items-center basis-full">
          <p
            className={cn("font-bold", {
              "text-destructive": latestStreak === 0,
              "text-secondary": latestStreak > 0,
            })}
          >
            {latestStreak} Day{latestStreak === 1 ? "" : "s"} Streak
          </p>
          <CalendarCheckIcon width={25} height={25} />
        </div>
        <p className="text-sm text-gray-400 font-medium">
          {latestStreak === 0 ? "It's never too late to start" : "Keep it up!"}
        </p>
      </div>
      <StatsDrawer
        isOpen={isOpen && (!mysteryBoxId || mysteryBoxClosed)}
        onClose={() => setIsOpen(false)}
        title="Streak"
        description="Keep going! Streaks track consecutive days you've answered or
          revealed. How long can you keep it up?"
        type={HOME_STAT_CARD_TYPE.STREAK as keyof typeof HOME_STAT_CARD_TYPE}
      />
    </>
  );
};

export default LatestStreakBox;
