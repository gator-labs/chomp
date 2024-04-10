"use client";

import { useState } from "react";
import { SearchInput } from "../SearchInput/SearchInput";
import { InfoIcon } from "../Icons/InfoIcon";
import { FilterIcon } from "../Icons/FilterIcon";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { usePathname, useRouter } from "next/navigation";
import { Modal } from "../Modal/Modal";

type HomeFiltersProps = {
  initialQuery: string;
  onQueryChange: (query: string) => void;
};

export function HomeFilters({
  initialQuery = "",
  onQueryChange,
}: HomeFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [homeFilters, setValue] = useLocalStorage(
    "home-filters",
    [] as { suggestion: string; isSearched: boolean }[]
  );
  const [query, setQuery] = useState(initialQuery);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const onValueSelected = (value: string) => {
    if (!homeFilters.some((hf) => hf.suggestion === value)) {
      setValue([{ suggestion: value, isSearched: true }, ...homeFilters]);
    }
    const searchParams = new URLSearchParams({ query: value });
    const query = searchParams ? `?${searchParams}` : "";
    router.push(`${pathname}${query}`);
    setQuery(value);
    onQueryChange(value);
  };

  return (
    <div className="flex w-full px-4 gap-4 items-center">
      <SearchInput
        value={query}
        onChange={(value) => setQuery(value)}
        onSelected={onValueSelected}
        placeholder="Search Questions"
        suggestions={[
          ...(query ? [{ suggestion: query, isSearched: false }] : []),
          ...homeFilters,
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
        </p>
        <p>
          We are also in the process of implementing additional points and/or
          token rewards through multi-day streaks and sweepstakes
        </p>
      </Modal>
    </div>
  );
}
