"use client";

import { getHistoryDecks } from "@/app/actions/history";
import HistoryListSkeleton from "@/app/components/HistoryListSkeleton/HistoryListSkeleton";
import LoadMore from "@/app/components/LoadMore/LoadMore";
import NoDeck from "@/app/components/NoDecks/NoDeck";
import { HISTORY_DECK_LIMIT } from "@/app/constants/decks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { HistoryDeckCard } from "./HistoryDeckCard";

export default function HistoryList() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetching } =
    useInfiniteQuery({
      queryKey: ["history-decks"],
      queryFn: ({ pageParam }) => getHistoryDecks({ pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        const totalCount = lastPage?.[0]?.total_count;
        const totalPages = totalCount
          ? Math.ceil(totalCount / HISTORY_DECK_LIMIT)
          : allPages.length;
        if (totalPages === allPages.length) {
          return undefined;
        }
        return allPages.length + 1;
      },
    });

  const formattedData = useMemo(() => {
    return data?.pages.reduce((acc, page) => {
      return [...acc, ...page];
    }, []);
  }, [data]);

  if (
    (formattedData?.length === 0 || formattedData === undefined) &&
    !isFetching
  ) {
    return <NoDeck />;
  }

  if (isLoading) return <HistoryListSkeleton />;

  return (
    <div className="flex flex-col gap-2 overflow-hidden">
      <ul className="flex flex-col gap-2 overflow-y-auto pb-2">
        {formattedData?.map((deck) => (
          <li key={deck.id}>
            <HistoryDeckCard deck={deck} />
          </li>
        ))}
      </ul>
      <LoadMore
        isFetching={isFetching}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
      />
    </div>
  );
}
