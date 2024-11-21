"use client";

import useInfiniteQuestionsHistory from "@/app/_reactQuery/useInfiniteQuestionsHistory";

import HistoryListSkeleton from "../HistoryListSkeleton/HistoryListSkeleton";
import QuestionRowCard from "../QuestionRowCard/QuestionRowCard";
import Skeleton from "../Skeleton/Skeleton";

interface HistoryProps {
  deckId?: number;
}

export default function History({ deckId }: HistoryProps) {
  const { data, isFetchingNextPage, lastElementRef, isLoading } =
    useInfiniteQuestionsHistory(deckId);

  console.log({ data });

  if (isLoading) return <HistoryListSkeleton />;

  return (
    <div className="flex flex-col gap-2 overflow-hidden">
      <ul className="flex flex-col gap-2 overflow-y-auto pb-2">
        {data?.map((question) => (
          <QuestionRowCard
            key={question.id}
            {...question}
            ref={lastElementRef}
            deckId={deckId}
          />
        ))}
        {isFetchingNextPage && <Skeleton />}
      </ul>
    </div>
  );
}
