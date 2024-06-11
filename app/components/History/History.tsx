"use client";
import { useIsomorphicLayoutEffect } from "@/app/hooks/useIsomorphicLayoutEffect";
import { HistoryResult, HistorySortOptions } from "@/app/queries/history";
import { getAppendedNewSearchParams } from "@/app/utils/searchParams";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import TotalRewardsClaimAll from "./TotalRewardsClaimAll/TotalRewardsClaimAll";

const HistoryFeed = dynamic(
  () => import("@/app/components/HistoryFeed/HistoryFeed"),
  { ssr: false },
);

type HistoryProps = {
  sort: string;
};

const sortStateMachine = {
  [HistorySortOptions.Date]: HistorySortOptions.Claimable,
  [HistorySortOptions.Claimable]: HistorySortOptions.Revealed,
  [HistorySortOptions.Revealed]: HistorySortOptions.Date,
};

export default function History({ sort }: HistoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentSort, setCurrentSort] = useState(HistorySortOptions.Date);
  const [scrollToId, setScrollToId] = useState(0);
  const [response, setResponse] = useState<HistoryResult[]>([]);
  const [rewards, setRewards] = useState<{
    totalRevealedRewards: number;
  }>({ totalRevealedRewards: 0 });

  const getData = async (sort: HistorySortOptions, scrollId?: number) => {
    const searchParams = new URLSearchParams();
    if (sort) {
      searchParams.set("sort", sort);
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
    getData(HistorySortOptions[sort as keyof typeof HistorySortOptions]);
  }, []);

  const handleSort = () => {
    const nextSort = sortStateMachine[currentSort];
    setCurrentSort(nextSort);
    const newParams = getAppendedNewSearchParams({ sort: nextSort.toString() });
    router.push(`${pathname}${newParams}`);
    getData(nextSort);
  };

  const onRefreshCards = () => {
    getData(currentSort);
  };

  return (
    <>
      <TotalRewardsClaimAll
        totalRevealedRewards={rewards.totalRevealedRewards}
        onRefresh={onRefreshCards}
      />
      <div
        className="px-4 pt-4 text-base font-sora cursor-pointer"
        onClick={handleSort}
      >
        <span>Sort by: </span>
        <span className="font-bold">{sort}</span>
      </div>
      {response && (
        <HistoryFeed list={response} elementToScrollToId={scrollToId} />
      )}
    </>
  );
}
