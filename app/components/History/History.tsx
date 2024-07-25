"use client";
import { useIsomorphicLayoutEffect } from "@/app/hooks/useIsomorphicLayoutEffect";
import {
  HistoryResult,
  HistorySortOptions,
  HistoryTypeOptions,
} from "@/app/queries/history";
import { getAppendedNewSearchParams } from "@/app/utils/searchParams";
import { useRouter } from "next-nprogress-bar";
import { usePathname } from "next/navigation";
import { useState } from "react";
import HistoryFeed from "../HistoryFeed/HistoryFeed";
import Sheet from "../Sheet/Sheet";
import RadioButton from "./RadioButton/RadioButton";

type HistoryProps = {
  sort: string;
  type: string;
  totalClaimableRewards: number;
};

export default function History({ sort, type }: HistoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentSort, setCurrentSort] = useState(HistorySortOptions.Date);
  const [currentType, setCurrentType] = useState(HistoryTypeOptions.Deck);

  const [response, setResponse] = useState<HistoryResult[]>([]);

  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);

  const getData = async (
    sort: HistorySortOptions,
    type: HistoryTypeOptions,
  ) => {
    const searchParams = new URLSearchParams();
    if (sort) {
      searchParams.set("sort", sort);
    }
    if (type) {
      searchParams.set("type", type);
    }
    const params = searchParams.toString() ? `?${searchParams}` : "";
    const data = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/history${params}`,
    );
    const json = await data.json();
    setResponse(json.history);
  };

  useIsomorphicLayoutEffect(() => {
    getData(
      HistorySortOptions[sort as keyof typeof HistorySortOptions],
      HistoryTypeOptions[type as keyof typeof HistoryTypeOptions],
    );
  }, []);

  const handleSort = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextSort = event.target.value as HistorySortOptions;
    setCurrentSort(nextSort);
    const newParams = getAppendedNewSearchParams({
      sort: nextSort.toString(),
      type: currentType.toString(),
    });
    setIsSortSheetOpen(false);
    router.push(`${pathname}${newParams}`);
    getData(nextSort, currentType);
  };

  return (
    <div className="flex flex-col gap-2 overflow-hidden">
      <div className="flex flex-row justify-between py-[3.8px]">
        <div
          className="cursor-pointer flex"
          onClick={() => {
            setIsSortSheetOpen(true);
          }}
        >
          <p className="text-sm">
            Sort by:
            <span className="text-sm font-bold ml-1">{sort}</span>
          </p>

          <Sheet
            isOpen={isSortSheetOpen}
            setIsOpen={setIsSortSheetOpen}
            closeIconHeight={16}
            closeIconWidth={16}
          >
            <div className="px-6">
              <span className="font-sora text-base font-bold text-[#CFC5F7]">
                Sort by
              </span>
            </div>
            <div className="flex flex-col gap-6 p-6">
              <RadioButton
                value={HistorySortOptions.Date}
                checked={currentSort === HistorySortOptions.Date}
                text="Chomp Date (most recent first)"
                onChange={handleSort}
              />
              <RadioButton
                value={HistorySortOptions.Revealed}
                checked={currentSort === HistorySortOptions.Revealed}
                text="Revealed"
                onChange={handleSort}
              />
              <RadioButton
                value={HistorySortOptions.Claimable}
                checked={currentSort === HistorySortOptions.Claimable}
                text="Claimed"
                onChange={handleSort}
              />
            </div>
          </Sheet>
        </div>
      </div>
      {response && <HistoryFeed list={response} />}
    </div>
  );
}
