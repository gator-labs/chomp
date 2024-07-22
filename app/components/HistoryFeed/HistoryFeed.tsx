"use client";
import { useWindowSize } from "@/app/hooks/useWindowSize";
import { HistoryResult } from "@/app/queries/history";
import { useEffect, useRef } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { HistoryFeedRowCard } from "../HistoryFeedRowCard/HistoryFeedRowCard";

export type HistoryFeedProps = {
  list: HistoryResult[];
  elementToScrollToId: number;
};

const SIZE_OF_ELEMENTS_ON_PROFILE = 448;

function HistoryFeed({ list, elementToScrollToId }: HistoryFeedProps) {
  const { height } = useWindowSize();
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  useEffect(() => {
    const elementToScroll = list.find((e) => e.id === elementToScrollToId);

    if (elementToScroll) {
      virtuosoRef.current?.scrollToIndex({
        index: list.indexOf(elementToScroll),
      });
    }
  }, [elementToScrollToId]);

  return (
    <Virtuoso
      style={{
        height: height - SIZE_OF_ELEMENTS_ON_PROFILE,
        overflowY: "visible",
      }}
      data={list.filter((item) => item.type === "Deck")}
      className="mx-4"
      itemContent={(_, element) => (
        <div className="pb-4">
          <HistoryFeedRowCard element={element} />
        </div>
      )}
    />
  );
}

export default HistoryFeed;
