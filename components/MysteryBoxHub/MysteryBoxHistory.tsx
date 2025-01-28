"use client";

import { fetchAllMysteryBoxes } from "@/app/actions/mysteryBox/fetchAll";
import { MysteryBox } from "@/types/mysteryBox";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import MysteryBoxHistoryCard from "./MysteryBoxHistoryCard";

type MysteryBoxHistoryProps = {};

function MysteryBoxHistory({}: MysteryBoxHistoryProps) {
  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: ["mystery-boxes"],
    queryFn: ({ pageParam }) =>
      fetchAllMysteryBoxes({ currentPage: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) {
        return undefined;
      }
      return allPages.length + 1;
    },
  });

  const mysteryBoxes: MysteryBox[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  return (
    <>
      <div className="flex flex-col gap-3 bg-[#202020] opacity-50% rounded-lg m-2 p-2">
        <div>
          <h1 className="bg-blue-pink-gradient inline-block text-transparent bg-clip-text font-bold py-2 px-2 text-xl">
            History
          </h1>
        </div>

        {/*<h2 className="font-extrabold py-1 px-2">Sort by Date</h2>*/}

        {mysteryBoxes?.length === 0 && !isFetching && (
          <div className="flex items-center justify-center py-8">
            No mystery boxes!
          </div>
        )}

        {mysteryBoxes?.map((box) => (
          <MysteryBoxHistoryCard box={box} key={box.id} />
        ))}

        {hasNextPage && (
          <div
            className="flex justify-center text-gray-400 text-sm pt-2 mb-6 cursor-pointer"
            onClick={() => fetchNextPage()}
          >
            {isFetching ? "..." : "Load more"}
          </div>
        )}
      </div>
    </>
  );
}

export default MysteryBoxHistory;
