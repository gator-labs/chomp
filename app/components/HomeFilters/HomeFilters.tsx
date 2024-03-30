"use client";

import { useState } from "react";
import { SearchInput } from "../SearchInput/SearchInput";
import { InfoIcon } from "../Icons/InfoIcon";
import { FilterIcon } from "../Icons/FilterIcon";

export function HomeFilters() {
  const [query, setQuery] = useState("");
  return (
    <div className="flex w-full px-4 gap-4 items-center">
      <SearchInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Questions"
      />
      <InfoIcon width={30} height={30} />
      <FilterIcon width={30} height={30} />
    </div>
  );
}
