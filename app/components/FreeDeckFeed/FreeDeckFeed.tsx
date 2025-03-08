import { DECK_LIMIT } from "@/app/constants/decks";
import { getFreeDecks } from "@/app/queries/home";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";

import { HomeFeedDeckCard } from "../HomeFeedDeckCard/HomeFeedDeckCard";
import LoadMore from "../LoadMore/LoadMore";
import NoDeck from "../NoDecks/NoDeck";

function FreeDeckFeed() {
  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: ["free-decks"],
    queryFn: ({ pageParam }) => getFreeDecks({ pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalCount = lastPage?.[0]?.total_count;
      const totalPages = totalCount
        ? Math.ceil(totalCount / DECK_LIMIT)
        : allPages.length;
      if (totalPages === allPages.length) {
        return undefined;
      }
      return allPages.length + 1;
    },
  });

  const formattedData = useMemo(() => {
    // Sanity check for null data and pages
    if (!data?.pages || !Array.isArray(data.pages)) return [];

    return data.pages.reduce((acc, page) => {
      // Type check for page
      if (!Array.isArray(page)) return acc;
      return [...acc, ...page];
    }, [] as any[]);
  }, [data]);

  if (
    (formattedData?.length === 0 || formattedData === undefined) &&
    !isFetching
  ) {
    return <NoDeck />;
  }
  return (
    <>
      {formattedData?.map((d) => (
        <div className="mt-2" key={d.id}>
          <HomeFeedDeckCard
            imageUrl={d.image}
            deck={d.deck}
            deckId={d.id}
            date={d?.date}
            answerCount={d.answerCount}
            revealAtAnswerCount={d.revealAtAnswerCount}
            revealAtDate={d.revealAtDate}
            status="start"
            deckCreditCost={d.total_credit_cost ? d.total_credit_cost : 0}
            totalQuestions={d.total_questions ? d.total_questions : 0}
            completedQuestions={
              d.completed_questions ? d.completed_questions : 0
            }
          />
        </div>
      ))}

      <LoadMore
        isFetching={isFetching}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
      />
    </>
  );
}

export default FreeDeckFeed;
