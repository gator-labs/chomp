"use client";
import { useState } from "react";
import { SearchInput } from "../SearchInput/SearchInput";
import { InfoIcon } from "../Icons/InfoIcon";
import { FilterIcon } from "../Icons/FilterIcon";
import { usePathname, useRouter } from "next/navigation";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { getAppendedNewSearchParams } from "@/app/utils/searchParams";

type SearchFiltersProps = {
  initialQuery: string;
  onQueryChange: (query: string) => void;
  backdropHeightReducedBy?: number;
};

export function SearchFilters({
  initialQuery = "",
  onQueryChange,
  backdropHeightReducedBy = 185,
}: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchFilters, setValue] = useLocalStorage(
    "home-filters",
    [] as { suggestion: string; isSearched: boolean }[]
  );
  const [query, setQuery] = useState(initialQuery);

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
      <InfoIcon width={30} height={30} />
      <FilterIcon width={30} height={30} />
    </div>
  );
}
