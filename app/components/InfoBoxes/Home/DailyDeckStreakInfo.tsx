"use client";
import { useState } from "react";
import Sheet from "../../Sheet/Sheet";

interface DailyDeckStreakProps {
  children: React.ReactNode;
}

const DailyDeckStreakInfo = ({ children }: DailyDeckStreakProps) => {
  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false);
  return (
    <div
      onClick={() => {
        setIsInfoSheetOpen(true);
      }}
      className="cursor-pointer h-full"
    >
      <div className="col-span-1 h-full">{children}</div>
      <Sheet
        isOpen={isInfoSheetOpen}
        setIsOpen={setIsInfoSheetOpen}
        closeIconHeight={16}
        closeIconWidth={16}
      >
        <div className="flex flex-col gap-5 px-5 pb-5">
          <div className="flex flex-col gap-5">
            <h3 className="text-purple-500 text-base font-bold  text-left">
              Longest Daily Deck Streak
            </h3>
            <p className="text-left flex flex-col gap-4">
              <p className="text-sm font-light  text-left">
                After you chomp through a daily deck, that day will be counted
                as one day toward your streak!
              </p>
              <p className="text-sm font-light  text-left">
                In addition to never missing a new deck, longer streaks could
                also earn you more rewards down the line.
              </p>
              <p className="text-sm font-light  text-left">
                We are still designing out future reward mechanisms, stay tuned!
              </p>
            </p>
          </div>
        </div>
      </Sheet>
    </div>
  );
};

export default DailyDeckStreakInfo;
