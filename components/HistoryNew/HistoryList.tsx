"use client";

import useInfiniteHistoryDecks from "@/app/_reactQuery/useInfiniteHistoryDecks";
import HistoryListSkeleton from "@/app/components/HistoryListSkeleton/HistoryListSkeleton";
import Skeleton from "@/app/components/Skeleton/Skeleton";

import { HistoryDeckCard } from "./HistoryDeckCard";

export default function HistoryList() {
  const { data, isFetchingNextPage, lastElementRef, isLoading } =
    useInfiniteHistoryDecks();

  if (isLoading) return <HistoryListSkeleton />;

  return (
    <div className="flex flex-col gap-2 overflow-hidden">
      <ul className="flex flex-col gap-2 overflow-y-auto pb-2">
        {data?.map((deck) => (
          <li ref={lastElementRef} key={deck.id}>
            <HistoryDeckCard deck={deck} />
          </li>
        ))}
        {isFetchingNextPage && <Skeleton />}
      </ul>
    </div>
  );
}
