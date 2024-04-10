"use client";
import { Deck, Question } from "@prisma/client";
import { useMemo } from "react";
import { Virtuoso } from "react-virtuoso";
import { useWindowSize } from "@/app/hooks/useWindowSize";
import { ElementType, FeedRowCard } from "../FeedRowCard.tsx/FeedRowCard";

export type HistoryFeedProps = {
  answeredUnrevealedQuestions: Question[];
  answeredUnrevealedDecks: Deck[];
  answeredRevealedQuestions: Question[];
  answeredRevealedDecks: Deck[];
};

const SIZE_OF_OTHER_ELEMENTS_ON_HOME_SCREEN = 458;

function HistoryFeed({
  answeredUnrevealedQuestions,
  answeredUnrevealedDecks,
  answeredRevealedQuestions,
  answeredRevealedDecks,
}: HistoryFeedProps) {
  const { height } = useWindowSize();
  const list = useMemo<Array<any>>(
    () => [
      ...answeredUnrevealedQuestions.map((q) => ({
        ...q,
        elementType: ElementType.Question,
      })),
      ...answeredUnrevealedDecks.map((d) => ({
        ...d,
        elementType: ElementType.Deck,
      })),
      ...answeredRevealedQuestions.map((q) => ({
        ...q,
        elementType: ElementType.Question,
      })),
      ...answeredRevealedDecks.map((d) => ({
        ...d,
        elementType: ElementType.Deck,
      })),
    ],
    [
      answeredUnrevealedQuestions,
      answeredUnrevealedDecks,
      answeredRevealedQuestions,
      answeredRevealedDecks,
    ]
  );

  return (
    <Virtuoso
      style={{ height: height - SIZE_OF_OTHER_ELEMENTS_ON_HOME_SCREEN }}
      data={list}
      className="mx-4 mt-4"
      itemContent={(_, element) => (
        <div className="pb-4">
          <FeedRowCard element={element} type={element.elementType} />
        </div>
      )}
    />
  );
}

export default HistoryFeed;
