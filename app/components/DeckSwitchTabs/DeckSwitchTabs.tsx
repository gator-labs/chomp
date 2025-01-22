"use client";

import { cn } from "@/app/utils/tailwind";

import { DECK_FILTERS } from "./constants";

interface Props {
  onClick: (value: string) => void;
  activeFilter: string;
}

const DeckSwitchTabs = ({ onClick, activeFilter }: Props) => {
  return (
    <ul className="p-1 gap-2 bg-gray-700 rounded-[48px] grid grid-cols-2">
      {DECK_FILTERS?.map((filter) => (
        <li
          className={cn("rounded-[32px] text-gray-400 cursor-pointer", {
            "bg-white text-gray-900 font-semibold":
              filter.value === activeFilter,
          })}
          key={filter.value}
          onClick={() => onClick(filter.value)}
        >
          <p className="text-xs h-[32px] flex items-center justify-center">
            {filter.label}
          </p>
        </li>
      ))}
    </ul>
  );
};

export default DeckSwitchTabs;
