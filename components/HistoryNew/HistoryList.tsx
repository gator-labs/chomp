"use client";

import HistoryListSkeleton from "@/app/components/HistoryListSkeleton/HistoryListSkeleton";
import LoadMore from "@/app/components/LoadMore/LoadMore";
import NoDeck from "@/app/components/NoDecks/NoDeck";
import { HISTORY_DECK_LIMIT } from "@/app/constants/decks";
import { DeckHistoryItem } from "@/types/history";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import NewHistoryHeader from "../NewHistoryHeader/NewHistoryHeader";
import { HistoryDeckCard } from "./HistoryDeckCard";

export default function HistoryList() {
  const [showAnsweredDeck, setShowAnsweredDeck] = useState(true);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetching } =
    useInfiniteQuery({
      queryKey: ["history-decks", showAnsweredDeck],
      queryFn: async ({
        pageParam,
      }): Promise<{ history: Array<DeckHistoryItem> }> => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/history/deck?pageParam=${pageParam}&showAnsweredDeck=${showAnsweredDeck}`,
        );
        if (!response.ok) throw new Error("Error getting decks history");
        const result = await response.json();
        if (!result?.history || !Array.isArray(result.history))
          throw new Error("Error parsing deck history");

        result.history = result.history.map((item: any) => ({
          ...item,
          revealAtDate: new Date(item.revealAtDate),
        }));

        return result;
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        const totalCount = lastPage.history[0]?.total_count;
        const totalPages = totalCount
          ? Math.ceil(totalCount / HISTORY_DECK_LIMIT)
          : allPages.length;

        return allPages.length < totalPages ? allPages.length + 1 : undefined;
      },
    });

  const formattedData = useMemo(() => {
    return data?.pages.reduce<DeckHistoryItem[]>(
      (acc: DeckHistoryItem[], page: { history: DeckHistoryItem[] }) => {
        return [...acc, ...page.history];
      },
      [],
    );
  }, [data?.pages]);

  return (
    <>
      <NewHistoryHeader
        handleToggleChange={() => setShowAnsweredDeck(!showAnsweredDeck)}
        showAnsweredDeck={showAnsweredDeck}
      />
      {isLoading ? (
        <HistoryListSkeleton />
      ) : (
        <>
          {/* Check for empty or undefined data */}
          {formattedData?.length === 0 || formattedData === undefined ? (
            <NoDeck />
          ) : (
            <div className="flex flex-col gap-2 overflow-hidden">
              {/* List of Decks */}
              <ul className="flex flex-col gap-2 overflow-y-auto pb-2">
                {formattedData?.map((deck) => (
                  <li key={deck.id}>
                    <HistoryDeckCard deck={deck} />
                  </li>
                ))}
              </ul>

              {/* Load More Button */}
              <LoadMore
                isFetching={isFetching}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
