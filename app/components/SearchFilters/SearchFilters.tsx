"use client";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { getAppendedNewSearchParams } from "@/app/utils/searchParams";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FilterIcon } from "../Icons/FilterIcon";
import { InfoIcon } from "../Icons/InfoIcon";
import { Modal } from "../Modal/Modal";
import { SearchInput } from "../SearchInput/SearchInput";

type SearchFiltersProps = {
  initialQuery: string;
  onQueryChange: (query: string) => void;
  backdropHeightReducedBy?: number;
};

function SearchFilters({
  initialQuery = "",
  onQueryChange,
  backdropHeightReducedBy = 185,
}: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchFilters, setValue] = useLocalStorage(
    "home-filters",
    [] as { suggestion: string; isSearched: boolean }[],
  );
  const [query, setQuery] = useState(initialQuery);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const setQueryWrapper = (value: string) => {
    setQuery(value);

    if (value === "") {
      onValueSelected(value);
    }
  };

  const onValueSelected = (value: string) => {
    if (!searchFilters.some((hf) => hf.suggestion === value) && value !== "") {
      setValue([{ suggestion: value, isSearched: true }, ...searchFilters]);
    }
    const newParams = getAppendedNewSearchParams({ query: value });
    router.push(`${pathname}${newParams}`);
    setQuery(value);
    onQueryChange(value);
  };

  return (
    <div className="flex w-full px-4 gap-4 items-center">
      <SearchInput
        value={query}
        onChange={setQueryWrapper}
        onSelected={onValueSelected}
        placeholder="Search Questions"
        backdropHeightReducedBy={backdropHeightReducedBy}
        suggestions={[
          ...(query ? [{ suggestion: query, isSearched: false }] : []),
          ...searchFilters,
        ].filter((suggestion) => suggestion.suggestion !== initialQuery)}
      />
      <div onClick={() => setIsInfoModalOpen(true)}>
        <InfoIcon width={30} height={30} />
      </div>
      <FilterIcon width={30} height={30} />
      <Modal
        title="How rewards are calculated"
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      >
        <p className="mb-3">
          Your rewards are based on both quantity and quality of your
          contribution to Chomp.
        </p>
        <p className="mb-3">
          When you perform the following actions on Chomp, you will earn a
          correlating amount of points:
        </p>
        <ul className="list-disc">
          <li className="list-item ml-5">
            A question you ask gets vetted and accepted: 69 points
          </li>
          <li className="list-item ml-5">Answer a full stack: 20 points</li>
          <li className="list-item ml-5">Answer a question: 10 points</li>
          <li className="list-item ml-5">Reveal an answer: 42 points</li>
          <li className="list-item ml-5">
            Get 1st order question exactly right: 6.9 points
          </li>
          <li className="list-item ml-5">
            Get 2nd order question exactly right: 15 points
          </li>
        </ul>
        <p>
          We are also in the process of implementing additional points and/or
          token rewards through multi-day streaks and sweepstakes.
        </p>
      </Modal>
    </div>
  );
}

export default SearchFilters;
