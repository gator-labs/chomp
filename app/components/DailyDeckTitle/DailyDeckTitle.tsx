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
    <div className="text-sm font-sora flex items-center justify-between">
      <div className="flex gap-2 items-center">
        <div className="h-[29px] px-4 bg-[#E6E6E6] rounded-[56px] flex items-center justify-center">
          <span className=" text-btn-text-primary text-xs font-bold">
            Daily Deck
          </span>
        </div>
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
          className="flex flex-col gap-6 fixed z-50 bg-[#333333] p-6 bottom-[80px] rounded-tl-[32px] rounded-tr-[32px] left-0 w-full
        after:content-empty after:fixed after:top-0 after:left-0 after:w-full after:h-full after:-z-10 after:bg-black after:opacity-60
        "
        >
          <div className="flex items-center justify-between">
            <p className="text-base">
              You’re viewing a <span className="text-purple">Daily Deck</span>{" "}
            </p>
            <div onClick={() => setIsInfoModalOpen(false)}>
              <CloseIcon width={16} height={16} />
            </div>
          </div>
          <p className="text-sm">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum
          </p>
        </div>
      )}
    </div>
  );
}
