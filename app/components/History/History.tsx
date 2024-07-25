"use client";

import { HistoryResult, HistorySortOptions } from "@/app/queries/history";
import { useState } from "react";
import HistoryFeed from "../HistoryFeed/HistoryFeed";
import Sheet from "../Sheet/Sheet";
import RadioButton from "./RadioButton/RadioButton";

type HistoryProps = {
  deckHistory: HistoryResult[];
};

export default function History({ deckHistory }: HistoryProps) {
  const [currentSort, setCurrentSort] = useState(HistorySortOptions.Date);

  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);

  const handleSort = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextSort = event.target.value as HistorySortOptions;
    console.log(nextSort);
    setCurrentSort(nextSort);
    setIsSortSheetOpen(false);
  };

  const sortedDeckHistory = deckHistory.sort((a, b) => {
    if (currentSort === HistorySortOptions.Claimable)
      return a.isClaimed === b.isClaimed ? 0 : a.isClaimed ? -1 : 1;

    if (currentSort === HistorySortOptions.Revealed)
      return a.isRevealed === b.isRevealed ? 0 : a.isRevealed ? -1 : 1;

    const dateA = new Date(a.revealAtDate);
    const dateB = new Date(b.revealAtDate);

    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="flex flex-col gap-2 overflow-hidden">
      <div className="flex flex-row justify-between py-[3.8px]">
        <div
          className="cursor-pointer flex"
          onClick={() => {
            setIsSortSheetOpen(true);
          }}
        >
          <p className="text-sm">
            Sort by:
            <span className="text-sm font-bold ml-1">{currentSort}</span>
          </p>

          <Sheet
            isOpen={isSortSheetOpen}
            setIsOpen={setIsSortSheetOpen}
            closeIconHeight={16}
            closeIconWidth={16}
          >
            <div className="px-6">
              <span className="font-sora text-base font-bold text-[#CFC5F7]">
                Sort by
              </span>
            </div>
            <div className="flex flex-col gap-6 p-6">
              <RadioButton
                value={HistorySortOptions.Date}
                checked={currentSort === HistorySortOptions.Date}
                text="Chomp Date (most recent first)"
                onChange={handleSort}
              />
              <RadioButton
                value={HistorySortOptions.Revealed}
                checked={currentSort === HistorySortOptions.Revealed}
                text="Revealed"
                onChange={handleSort}
              />
              <RadioButton
                value={HistorySortOptions.Claimable}
                checked={currentSort === HistorySortOptions.Claimable}
                text="Claimed"
                onChange={handleSort}
              />
            </div>
          </Sheet>
        </div>
      </div>
      <HistoryFeed list={sortedDeckHistory} />
    </div>
  );
}
