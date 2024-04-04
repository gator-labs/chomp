import classNames from "classnames";
import { SearchIcon } from "../Icons/SearchIcon";
import { useRef, useState } from "react";
import { HistoryIcon } from "../Icons/HistoryIcon";
import { useOuterClick } from "@/app/hooks/useOuterClick";

type SearchInputProps = {
  onChange: (value: string) => void;
  suggestions?: {
    suggestion: string;
    isSearched: boolean;
  }[];
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">;

export function SearchInput({
  onChange,
  suggestions,
  ...props
}: SearchInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const containerRef = useOuterClick(() => {
    setShowDropdown(false);
  });

  return (
    <div
      onClick={() => {
        inputRef.current?.focus();
        setShowDropdown(true);
      }}
      className={classNames(
        "flex align-center uppercase border-4 border-search-gray gap-[4px] py-2 px-3 rounded-full w-full text-white bg-black relative"
      )}
      ref={containerRef}
    >
      <SearchIcon width={24} height={24} />
      <input
        ref={inputRef}
        {...props}
        className={classNames("transparent outline-none text-[10px] bg-black")}
        onChange={(e) => onChange?.(e.target.value)}
      />
      <ul
        className={classNames(
          "absolute top-11 -left-5 z-30 bg-[#000] w-screen p-8 pb-4 flex flex-col gap-4",
          { ["hidden"]: !showDropdown }
        )}
      >
        {suggestions?.map(({ suggestion, isSearched }) => (
          <li
            className="flex gap-1 items-center cursor-pointer normal-case"
            onClick={() => onChange?.(suggestion)}
            key={suggestion}
          >
            {isSearched && <HistoryIcon />}
            <span>{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
