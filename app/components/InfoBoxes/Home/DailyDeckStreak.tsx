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
      className="cursor-pointer"
    >
      <div className="col-span-1">{children}</div>
      <Sheet
        isOpen={isInfoSheetOpen}
        setIsOpen={setIsInfoSheetOpen}
        closIconHeight={16}
        closIconWidth={16}
      >
        <div className="flex flex-col gap-5 px-5 pb-5">
          <div className="flex flex-col gap-5">
            <h3 className="text-purple text-base font-bold leading-[20.16px] text-left">
              Longest Daily Deck Streak
            </h3>
            <p className="text-left flex flex-col gap-4">
              <p className="text-[13px] font-light leading-[16.38px] text-left">
                After you chomp through a daily deck, that day will be counted
                as one day toward your streak!
              </p>
              <p className="text-[13px] font-light leading-[16.38px] text-left">
                You might be chomping just slightly slower than a wild gator,
                but this shows you exactly how fast you can go while still
                giving each question your best answer.
              </p>
              <p className="text-[13px] font-light leading-[16.38px] text-left">
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
