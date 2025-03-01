"use client";

import useInfiniteNewQuestionsHistory from "@/app/_reactQuery/useInfiniteNewQuestionsHistory";
import HistoryListSkeleton from "@/app/components/HistoryListSkeleton/HistoryListSkeleton";
import Skeleton from "@/app/components/Skeleton/Skeleton";

import { QuestionCard } from "./QuestionCard";

interface HistoryProps {
  deckId?: number;
  deckTitle?: string;
}

export default function History({ deckId }: HistoryProps) {
  const { data, isFetchingNextPage, lastElementRef, isLoading } =
    useInfiniteNewQuestionsHistory(deckId);

  if (isLoading) return <HistoryListSkeleton />;

  return (
    <div className="flex flex-col gap-2 overflow-hidden">
      <ul className="flex flex-col gap-2 overflow-y-auto pb-2">
        {data?.map((question) => (
          <li ref={lastElementRef} key={question.id}>
            <QuestionCard
              title={question.question}
              deckTitle={question.deckTitle}
              questionId={question.id}
              indicatorType={question.indicatorType}
              revealAtDate={question.revealAtDate}
            />
          </li>
        ))}
        {isFetchingNextPage && <Skeleton />}
      </ul>
    </div>
  );
}
