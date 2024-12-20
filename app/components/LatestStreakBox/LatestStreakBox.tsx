"use client";

import { HOME_STAT_CARD_TYPE } from "@/app/constants/tracking";
import MysteryBox from "@/components/MysteryBox/MysteryBox";
import { cn } from "@/lib/utils";
import { CalendarCheckIcon } from "lucide-react";
import { revalidatePath } from "next/cache";
import { CSSProperties, useEffect, useState } from "react";

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
  const [isMysteryBoxOpen, setIsMysteryBoxOpen] = useState<boolean>(false);
  const [isMysteryBoxSeen, setIsMysteryBoxSeen] = useState<boolean>(false);

  useEffect(() => {
    setIsMysteryBoxSeen(false);
  }, [mysteryBoxId]);

  const hasChompmasStreak =
    !!mysteryBoxId &&
    latestStreak >= Number(process.env.NEXT_PUBLIC_CHOMPMAS_MIN_STREAK!);

  return (
    <>
      {hasChompmasStreak ? (
        <AnimatedGradientBorder
          onClick={() => setIsMysteryBoxOpen(true)}
          className="w-full rounded-[8px] bg-gray-800 flex flex-col gap-0 transition-all duration-200 hover:bg-gray-700 cursor-pointer"
        >
          <div className="flex justify-between items-center basis-full w-full">
            <p
              className="font-bold"
              style={
                {
                  background:
                    "linear-gradient(var(--angle), #F9F1FB 0%, #89C9FF 29%, #AF7CE7 60%, #FBD7FF 100%)",
                  "-webkit-background-clip": "text",
                  "-webkit-text-fill-color": "transparent",
                  "--bg-color": "linear-gradient(#1B1B1B, #1B1B1B)",
                } as CSSProperties
              }
            >
              {latestStreak} Day{latestStreak === 1 ? "" : "s"} Streak
            </p>

            <CalendarCheckIcon width={25} height={25} />
          </div>
          <p className="text-sm text-green font-medium w-full">
            Claim your <br /> CHOMPmas box
          </p>
        </AnimatedGradientBorder>
      ) : (
        <>
          <div
            onClick={() =>
              mysteryBoxId && !isMysteryBoxSeen
                ? setIsMysteryBoxOpen(true)
                : setIsOpen(true)
            }
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
              {latestStreak === 0
                ? "It's never too late to start"
                : "Keep it up!"}
            </p>
          </div>
          <StatsDrawer
            isOpen={isOpen && !isMysteryBoxOpen}
            onClose={() => setIsOpen(false)}
            title="Streak"
            description="Keep going! Streaks track consecutive days you've answered or
          revealed. How long can you keep it up?"
            type={
              HOME_STAT_CARD_TYPE.STREAK as keyof typeof HOME_STAT_CARD_TYPE
            }
          />
        </>
      )}

      {!isMysteryBoxSeen && mysteryBoxId && (
        <MysteryBox
          isOpen={isMysteryBoxOpen}
          closeBoxDialog={() => {
            setIsMysteryBoxOpen(false);
            setIsMysteryBoxSeen(true);
            revalidatePath("/application");
            revalidatePath("/tutorial");
          }}
          mysteryBoxId={mysteryBoxId}
          skipAction={"Close"}
          isDismissed={false}
          isChompmasBox={true}
        />
      )}
    </>
  );
};

export default LatestStreakBox;
