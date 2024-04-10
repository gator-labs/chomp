"use client";
import { Deck, Question } from "@prisma/client";
import { Virtuoso } from "react-virtuoso";
import { useWindowSize } from "@/app/hooks/useWindowSize";
import { FeedRowCard } from "../FeedRowCard.tsx/FeedRowCard";
import { ElementType } from "@/app/queries/question";

export type HistoryFeedProps = {
  list: Array<(Question | Deck) & { elementType: ElementType }>;
};

const SIZE_OF_OTHER_ELEMENTS_ON_HOME_SCREEN = 458;

function HistoryFeed({ list }: HistoryFeedProps) {
  const { height } = useWindowSize();

  return (
    <Virtuoso
      style={{ height: height - SIZE_OF_OTHER_ELEMENTS_ON_HOME_SCREEN }}
      data={list}
      className="mx-4 mt-4"
      itemContent={(_, element) => (
        <div className="pb-4">
          <FeedRowCard
            element={element}
            type={element.elementType}
            deckReturnUrl={window.location.toString()}
          />
        </div>
      )}
    />
  );
}

export default HistoryFeed;
