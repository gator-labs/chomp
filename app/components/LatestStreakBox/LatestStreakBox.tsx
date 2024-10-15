"use client";

import {
  HOME_STAT_CARD_TYPE,
  TRACKING_EVENTS,
  TRACKING_METADATA,
} from "@/app/constants/tracking";
import trackEvent from "@/lib/trackEvent";
import { cn } from "@/lib/utils";
import { Goal } from "lucide-react";
import { useState } from "react";
import StreakInfoDrawer from "../StreakInfoDrawer/StreakInfoDrawer";

type LatestStreakBoxProps = {
  latestStreak: number;
};

const LatestStreakBox = ({ latestStreak }: LatestStreakBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = async () => {
    setIsOpen(false);

    await trackEvent(TRACKING_EVENTS.HOME_STAT_CARD_DIALOG_CLOSED, {
      [TRACKING_METADATA.TYPE]: HOME_STAT_CARD_TYPE.STREAK,
    });
  };

  const openStreakDrawer = async () => {
    setIsOpen(true);

    await trackEvent(TRACKING_EVENTS.HOME_STAT_CARD_DIALOG_OPENED, {
      [TRACKING_METADATA.TYPE]: HOME_STAT_CARD_TYPE.STREAK,
    });
  };

  return (
    <>
      <div
        onClick={openStreakDrawer}
        className="w-full rounded-[8px] border-[0.5px] border-solid p-4 border-gray-500 bg-gray-700 flex gap-4 items-center"
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
      <StreakInfoDrawer isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default LatestStreakBox;
