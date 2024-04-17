"use client";
import { useOuterClick } from "@/app/hooks/useOuterClick";
import classNames from "classnames";
import { useRef, useState } from "react";
import { HistoryIcon } from "../Icons/HistoryIcon";
import { SearchIcon } from "../Icons/SearchIcon";

type SearchInputProps = {
  onChange: (value: string) => void;
  onSelected: (value: string) => void;
  suggestions?: {
    suggestion: string;
    isSearched: boolean;
  }[];
  backdropHeightReducedBy?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">;

export function SearchInput({
  onChange,
  onSelected,
  suggestions,
  backdropHeightReducedBy = 185,
  ...props
}: SearchInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const containerRef = useOuterClick(() => {
    setShowDropdown(false);
  });

  return (
    <div className="relative w-full">
      <div
        onClick={() => {
          inputRef.current?.focus();
          setShowDropdown(true);
        }}
        className="flex align-center uppercase border-4 border-search-gray gap-[4px] py-2 px-3 rounded-full w-full text-white bg-black"
        ref={containerRef}
      >
        <SearchIcon width={24} height={24} />
        <input
          ref={inputRef}
          {...props}
          className="transparent outline-none text-[10px] bg-black"
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
      <div
        style={{ height: `calc(100vh - ${backdropHeightReducedBy}px)` }}
        className={classNames(
          "absolute w-[99vw] top-12 bottom-0 -left-3.5 bg-[#0D0D0DCC] z-30 overflow-y-scroll",
          {
            hidden: !showDropdown,
          },
        )}
      >
        {suggestions && suggestions?.length > 0 && (
          <ul className="z-30 bg-[#000] p-8 pb-4 flex flex-col gap-4">
            {suggestions?.map(({ suggestion, isSearched }, index) => (
              <li
                className="flex gap-1 items-center cursor-pointer normal-case"
                onClick={() => onSelected?.(suggestion)}
                key={index}
              >
                {isSearched && <HistoryIcon />}
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
