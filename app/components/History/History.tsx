"use client";

import useInfiniteQuestionsHistory from "@/app/_reactQuery/useInfiniteQuestionsHistory";
import QuestionRowCard from "../QuestionRowCard/QuestionRowCard";
import Skeleton from "../Skeleton/Skeleton";

export default function History() {
  const { data, isFetchingNextPage, lastElementRef, isLoading } =
    useInfiniteQuestionsHistory();

  return (
    <div className="flex flex-col gap-2 overflow-hidden">
      <ul className="flex flex-col gap-2 overflow-y-auto pb-2">
        {data?.map((question) => (
          <QuestionRowCard
            key={question.id}
            {...question}
            ref={lastElementRef}
          />
        ))}
        {(isFetchingNextPage || isLoading) && <Skeleton />}
      </ul>
    </div>
  );
}
