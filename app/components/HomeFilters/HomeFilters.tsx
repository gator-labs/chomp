"use client";

import { useState } from "react";
import { SearchInput } from "../SearchInput/SearchInput";
import { InfoIcon } from "../Icons/InfoIcon";
import { FilterIcon } from "../Icons/FilterIcon";

const searchSuggestionsStub = [
  { suggestion: "Search suggestion 1", isSearched: true },
  { suggestion: "Search suggestion 2", isSearched: true },
  { suggestion: "Search suggestion 3", isSearched: false },
  { suggestion: "Search suggestion 4", isSearched: false },
];

export function HomeFilters() {
  const [query, setQuery] = useState("");
  return (
    <div className="flex w-full px-4 gap-4 items-center">
      <SearchInput
        value={query}
        onChange={(value) => setQuery(value)}
        placeholder="Search Questions"
        suggestions={searchSuggestionsStub}
      />
      <InfoIcon width={30} height={30} />
      <FilterIcon width={30} height={30} />
    </div>
  );
}
