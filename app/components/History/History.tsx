"use client";
import { useIsomorphicLayoutEffect } from "@/app/hooks/useIsomorphicLayoutEffect";
import {
  HistoryResult,
  HistorySortOptions,
  HistoryTypeOptions,
} from "@/app/queries/history";
import { getAppendedNewSearchParams } from "@/app/utils/searchParams";
import { useRouter } from "next-nprogress-bar";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState } from "react";
import TotalRewardsClaimAll from "./TotalRewardsClaimAll/TotalRewardsClaimAll";

const HistoryFeed = dynamic(
  () => import("@/app/components/HistoryFeed/HistoryFeed"),
  { ssr: false },
);

type HistoryProps = {
  sort: string;
  type: string;
};

const sortStateMachine = {
  [HistorySortOptions.Date]: HistorySortOptions.Claimable,
  [HistorySortOptions.Claimable]: HistorySortOptions.Revealed,
  [HistorySortOptions.Revealed]: HistorySortOptions.Date,
};

const typeStateMachine = {
  [HistoryTypeOptions.Deck]: HistoryTypeOptions.Question,
  [HistoryTypeOptions.Question]: HistoryTypeOptions.Deck,
};

export default function History({ sort, type }: HistoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentSort, setCurrentSort] = useState(HistorySortOptions.Date);
  const [currentType, setCurrentType] = useState(HistoryTypeOptions.Deck);
  const [scrollToId, setScrollToId] = useState(0);
  const [response, setResponse] = useState<HistoryResult[]>([]);
  const [rewards, setRewards] = useState<{
    totalRevealedRewards: number;
  }>({ totalRevealedRewards: 0 });

  const getData = async (
    sort: HistorySortOptions,
    type: HistoryTypeOptions,
    scrollId?: number,
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
    setRewards({ totalRevealedRewards: +json.totalRevealedRewards });

    if (scrollId) {
      setScrollToId(scrollId);
    }
  };

  useIsomorphicLayoutEffect(() => {
    getData(
      HistorySortOptions[sort as keyof typeof HistorySortOptions],
      HistoryTypeOptions[type as keyof typeof HistoryTypeOptions],
    );
  }, []);

  const handleSort = () => {
    const nextSort = sortStateMachine[currentSort];
    setCurrentSort(nextSort);
    const newParams = getAppendedNewSearchParams({
      sort: nextSort.toString(),
      type: currentType.toString(),
    });
    router.push(`${pathname}${newParams}`);
    getData(nextSort, currentType);
  };

  const handleViewType = () => {
    const nextType = typeStateMachine[currentType];
    setCurrentType(nextType);
    const newParams = getAppendedNewSearchParams({
      sort: currentSort.toString(),
      type: nextType.toString(),
    });
    router.push(`${pathname}${newParams}`);
    getData(currentSort, nextType);
  };

  const onRefreshCards = () => {
    getData(currentSort, currentType);
  };

  return (
    <>
      <TotalRewardsClaimAll
        totalRevealedRewards={rewards.totalRevealedRewards}
        onRefresh={onRefreshCards}
      />
      <div className="flex flex-row justify-between">
        <div
          className="px-4 pt-4 text-base font-sora cursor-pointer"
          onClick={handleSort}
        >
          <span>Sort by: </span>
          <span className="font-bold">{sort}</span>
        </div>
        <div
          className="px-4 pt-4 text-base font-sora cursor-pointer"
          onClick={handleViewType}
        >
          <span>Viewing: </span>
          <span className="font-bold">{type}</span>
        </div>
      </div>
      {response && (
        <HistoryFeed list={response} elementToScrollToId={scrollToId} />
      )}
    </>
  );
}
