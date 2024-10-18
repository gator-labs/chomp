"use client";

import { getDailyDeckFormattedString } from "@/app/utils/dateUtils";
import { useState } from "react";

import { CloseIcon } from "../Icons/CloseIcon";
import { InfoIcon } from "../Icons/InfoIcon";

type DailyDeckTitleProps = {
  date: Date;
};

export function DailyDeckTitle({ date }: DailyDeckTitleProps) {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const monthAndDay = getDailyDeckFormattedString(date)
    .split(" ")
    .slice(0, 2)
    .join(" ");

  const year = getDailyDeckFormattedString(date).split(" ").slice(2).join(" ");

  return (
    <div className="text-sm  flex items-center justify-between mt-12">
      <div className="flex gap-2 items-center">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-xs">{monthAndDay}</span>
          <span className="text-xs">{year}</span>
        </div>
      </div>
      <div onClick={() => setIsInfoModalOpen(true)}>
        <InfoIcon />
      </div>
      {isInfoModalOpen && (
        <div
          className="flex flex-col gap-6 fixed z-50 bg-gray-700 p-6 bottom-[80px] rounded-tl-[32px] rounded-tr-[32px] left-0 w-full
        after:content-empty after:fixed after:top-0 after:left-0 after:w-full after:h-full after:-z-10 after:bg-gray-800 after:opacity-60
        "
        >
          <div className="flex items-center justify-between">
            <p className="text-base text-secondary">
              You’re viewing a Daily Deck
            </p>
            <div onClick={() => setIsInfoModalOpen(false)}>
              <CloseIcon width={16} height={16} />
            </div>
          </div>
          <p className="text-sm">
            Everyday Chomp will be sharing 3-5 cards for you to Chomp on.
          </p>
        </div>
      )}
    </div>
  );
}
