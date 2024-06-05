"use client";
import { revealQuestions } from "@/app/actions/chompResult";
import { useIsomorphicLayoutEffect } from "@/app/hooks/useIsomorphicLayoutEffect";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { HistoryResult, HistorySortOptions } from "@/app/queries/history";
import { getAppendedNewSearchParams } from "@/app/utils/searchParams";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

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
    potentialRewards: number;
  }>({ potentialRewards: 0, totalRevealedRewards: 0 });
  const { openRevealModal, closeRevealModal } = useRevealedContext();

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
    setRewards({
      totalRevealedRewards: json.totalRevealedRewards,
      potentialRewards: json.potentialRewards,
    });

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

  const onRefreshCards = (revealedId: number) => {
    getData(currentSort, revealedId);
  };

  const revealAll = useCallback(
    async (burnTx?: string, nftAddress?: string) => {
      const questionIds = response
        .filter(
          (qs) => qs.isRevealable && !qs.isRevealed && qs.type === "Question",
        )
        .map((qs) => qs?.id)
        .filter((id) => typeof id === "number")
        .map((id) => id as number);

      await revealQuestions(questionIds, burnTx, nftAddress);
      const newParams = getAppendedNewSearchParams({
        openIds: encodeURIComponent(JSON.stringify(questionIds)),
      });
      router.push(`${pathname}${newParams}`);
      onRefreshCards(questionIds[0]);
      closeRevealModal();
    },
    [response],
  );

  const handleOpenRevealModal = useCallback(
    () =>
      openRevealModal(
        revealAll,
        response
          .filter(
            (q) => q.isRevealable && !q.isRevealed && q.type === "Question",
          )
          .reduce((acc, cur) => acc + (cur?.revealTokenAmount ?? 0), 0),
        !!"multiple",
      ),
    [response],
  );

  return (
    <>
      {/*
      uncomment these out when bonk rewards are integrated
       <div className="flex justify-between px-4 my-4">
        <div className="flex flex-col justify-between">
          <div className="text-sm text-white font-sora">
            Total Revealed Rewards
          </div>
          <div className="text-base text-white font-sora">
            {numberToCurrencyFormatter.format(rewards.totalRevealedRewards)}{" "}
            BONK
          </div>
        </div>
        <Button variant="white" size="small" isPill className="basis-24">
          Claim all
        </Button>
      </div>
      <div className="flex justify-between px-4 mb-4">
        <div className="flex flex-col justify-between">
          <div className="text-sm text-white font-sora">Potential Rewards</div>
          <div className="text-base text-white font-sora">
            {numberToCurrencyFormatter.format(rewards.potentialRewards)} BONK
          </div>
        </div>
        <Button
          variant="white"
          size="small"
          className="basis-24"
          isPill
          onClick={handleOpenRevealModal}
        >
          Reveal all
        </Button>
      </div> */}
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
