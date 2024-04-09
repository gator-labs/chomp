"use client";

import { useState } from "react";
import { SearchInput } from "../SearchInput/SearchInput";
import { InfoIcon } from "../Icons/InfoIcon";
import { FilterIcon } from "../Icons/FilterIcon";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { usePathname, useRouter } from "next/navigation";

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
      <InfoIcon width={30} height={30} />
      <FilterIcon width={30} height={30} />
    </div>
  );
}
