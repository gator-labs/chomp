"use client";

import React, { useState } from "react";

import { InfoIcon } from "../Icons/InfoIcon";
import InfoDrawer from "../InfoDrawer/InfoDrawer";

function NewHistoryHeader({
  handleToggleChange,
  showAnsweredDeck,
}: {
  handleToggleChange: () => void;
  showAnsweredDeck: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <InfoDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="History"
      >
        <div className="text-sm mb-6 space-y-6">
          Browse all revealed decks here. Use the toggle above to filter decks
          you’ve answered (marked with purple cards).
        </div>
      </InfoDrawer>
      <div className="flex items-center gap-2">
        <label className="cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={showAnsweredDeck}
            onChange={handleToggleChange}
          />
          <div className="relative w-11 h-6 bg-gray-600 rounded-full peer-checked:bg-purple-200 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
        </label>
        <p className="text-sm">Only decks I&rsquo;ve answered.</p>
      </div>

      <div className="flex flex-row justify-between items-center">
        <h1 className="font-bold py-2 px-2 text-lg">History</h1>
        <button onClick={() => setIsOpen(true)}>
          <InfoIcon width={18} height={18} fill="#999999" />
        </button>
      </div>
    </>
  );
}

export default NewHistoryHeader;
