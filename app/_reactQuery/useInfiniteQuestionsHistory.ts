import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";
import { getQuestionsHistory } from "../actions/history";

export default function useInfiniteQuestionsHistory() {
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
    queryKey: ["questions-history"],
    queryFn: ({ pageParam }) => getQuestionsHistory({ pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length ? allPages.length + 1 : undefined;
    },
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
