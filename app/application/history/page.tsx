"use client";
import { revealQuestions } from "@/app/actions/reveal";
import { HistorySortOptions } from "@/app/api/history/route";
import { Button } from "@/app/components/Button/Button";
import { HomeSwitchNavigation } from "@/app/components/HomeSwitchNavigation/HomeSwitchNavigation";
import { useIsomorphicLayoutEffect } from "@/app/hooks/useIsomorphicLayoutEffect";
import { useCollapsedContext } from "@/app/providers/CollapsedProvider";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { DeckQuestionIncludes, getQuestionState } from "@/app/utils/question";
import { getAppendedNewSearchParams } from "@/app/utils/searchParams";
import { Deck } from "@prisma/client";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
const SearchFilters = dynamic(
  () => import("@/app/components/SearchFilters/SearchFilters"),
  { ssr: false },
);
const HistoryFeed = dynamic(
  () => import("@/app/components/HistoryFeed/HistoryFeed"),
  { ssr: false },
);

type PageProps = {
  searchParams: { query: string; sort: string; openIds: string };
};

const sortStateMachine = {
  [HistorySortOptions.Date]: HistorySortOptions.Claimable,
  [HistorySortOptions.Claimable]: HistorySortOptions.Revealed,
  [HistorySortOptions.Revealed]: HistorySortOptions.Date,
};

type DeckTypeWithIncludes = Deck & {
  deckQuestions: { question: DeckQuestionIncludes }[];
};

let lastQuery: string | undefined = "";

export default function Page({ searchParams }: PageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sort, setSort] = useState(HistorySortOptions.Date);
  const [scrollToId, setScrollToId] = useState(0);
  const [response, setResponse] = useState<[]>();
  const [rewards, setRewards] = useState<{
    totalRevealedRewards: number;
    potentionalRewards: number;
  }>({ potentionalRewards: 0, totalRevealedRewards: 0 });
  const { setOpen } = useCollapsedContext();
  const { openRevealModal, closeRevealModal } = useRevealedContext();
  const questionStatuses = useMemo(() => {
    if (!response) {
      return [];
    }

    return response.flatMap((element) => {
      const question = element as DeckQuestionIncludes;
      if (question.question) {
        return [{ question, state: getQuestionState(question) }];
      }

      const deck = element as DeckTypeWithIncludes;
      if (deck.deck) {
        return deck.deckQuestions.map((dq) => ({
          question: dq.question,
          state: getQuestionState(dq.question),
        }));
      }
    });
  }, [response]);

  const getData = async (
    query: string | undefined,
    sort: HistorySortOptions,
    srollId?: number,
  ) => {
    lastQuery = query;
    const searchParams = new URLSearchParams();
    if (query) {
      searchParams.set("query", query);
    }
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
      potentionalRewards: json.potentionalRewards,
    });

    if (srollId) {
      setScrollToId(srollId);
    }
  };

  useIsomorphicLayoutEffect(() => {
    getData(
      searchParams.query,
      HistorySortOptions[searchParams.sort as keyof typeof HistorySortOptions],
    );
  }, []);

  const handleSort = () => {
    const nextSort = sortStateMachine[sort];
    setSort(nextSort);
    const newParams = getAppendedNewSearchParams({ sort: nextSort.toString() });
    router.push(`${pathname}${newParams}`);
    getData(lastQuery, nextSort);
  };

  const onRefreshCards = (revealedId: number) => {
    getData(lastQuery, sort, revealedId);
  };

  useEffect(() => {
    if (searchParams.openIds) {
      const openIds = JSON.parse(decodeURIComponent(searchParams.openIds));
      openIds.forEach((questionId: string) => setOpen(+questionId));
    }
  }, [searchParams.openIds, setOpen]);

  const revealAll = useCallback(async () => {
    const questionIds = questionStatuses
      .filter((qs) => qs?.state.isRevealable && !qs.state.isRevealed)
      .map((qs) => qs?.question.id)
      .filter((id) => typeof id === "number")
      .map((id) => id as number);

    await revealQuestions(questionIds);
    const newParams = getAppendedNewSearchParams({
      openIds: encodeURIComponent(JSON.stringify(questionIds)),
    });
    router.push(`${pathname}${newParams}`);
    onRefreshCards(questionIds[0]);
    closeRevealModal();
  }, [questionStatuses]);

  return (
    <>
      <div className="px-4">
        <HomeSwitchNavigation />
      </div>
      <div className="mt-5">
        <SearchFilters
          initialQuery={searchParams.query}
          onQueryChange={(query) => {
            getData(query, sort);
          }}
          backdropHeightReducedBy={261}
        />
      </div>
      <div className="flex justify-between px-4 my-4">
        <div className="flex flex-col justify-between">
          <div className="text-sm text-white font-sora">
            Total Revealed Rewards
          </div>
          <div className="text-base text-white font-sora">
            {new Intl.NumberFormat().format(rewards.totalRevealedRewards)} BONK
          </div>
        </div>
        <div className="basis-36">
          <Button variant="white" isPill>
            Claim all
          </Button>
        </div>
      </div>
      <div className="flex justify-between px-4 mb-4">
        <div className="flex flex-col justify-between">
          <div className="text-sm text-white font-sora">
            Potentional Rewards
          </div>
          <div className="text-base text-white font-sora">
            {new Intl.NumberFormat().format(rewards.potentionalRewards)} BONK
          </div>
        </div>
        <div className="basis-36">
          <Button
            variant="white"
            isPill
            onClick={() => openRevealModal(revealAll)}
          >
            Reveal all
          </Button>
        </div>
      </div>
      <div
        className="px-4 pt-4 text-base font-sora cursor-pointer"
        onClick={handleSort}
      >
        <span>Sort by: </span>
        <span className="font-bold">{sort}</span>
      </div>
      {response && (
        <HistoryFeed
          list={response}
          onRefreshCards={onRefreshCards}
          elementToScrollToId={scrollToId}
        />
      )}
    </>
  );
}
