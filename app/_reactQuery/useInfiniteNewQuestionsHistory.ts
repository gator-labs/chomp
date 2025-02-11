import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";

import { getNewQuestionHistory } from "../actions/history";

export default function useInfiniteQuestionsHistory(deckId?: number) {
  const observer = useRef<IntersectionObserver>();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    ...rest
  } = useInfiniteQuery({
    queryKey: deckId
      ? [`new-questions-history-${deckId}`]
      : ["new-questions-history"],
    queryFn: ({ pageParam }) => getNewQuestionHistory({ pageParam, deckId }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length ? allPages.length + 1 : undefined;
    },
    staleTime: Infinity,
  });

  const formattedData = useMemo(() => {
    return data?.pages.reduce((acc, page) => {
      return [...acc, ...page];
    }, []);
  }, [data]);

  const lastElementRef = useCallback(
    (node: HTMLLIElement) => {
      if (isLoading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetching &&
          !isFetchingNextPage
        ) {
          fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isLoading, isFetching, isFetchingNextPage],
  );

  return {
    data: formattedData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    ...rest,
    lastElementRef,
  };
}
