"use client";
import { Deck, Question } from "@prisma/client";
import { useEffect, useMemo, useRef } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { useWindowSize } from "@/app/hooks/useWindowSize";
import { FeedRowCard } from "../FeedRowCard.tsx/FeedRowCard";
import { ElementType } from "@/app/queries/question";

export type HomeFeedProps = {
  unansweredDailyQuestions: Question[];
  unansweredUnrevealedQuestions: Question[];
  unansweredUnrevealedDecks: Deck[];
  answeredUnrevealedQuestions: Question[];
  answeredUnrevealedDecks: Deck[];
  answeredRevealedQuestions: Question[];
  answeredRevealedDecks: Deck[];
  onRefreshCards: (revealedId: number) => void;
  elementToScrollToId: number;
};

const SIZE_OF_OTHER_ELEMENTS_ON_HOME_SCREEN = 210;

export function HomeFeed({
  unansweredDailyQuestions,
  unansweredUnrevealedQuestions,
  unansweredUnrevealedDecks,
  answeredUnrevealedQuestions,
  answeredUnrevealedDecks,
  answeredRevealedQuestions,
  answeredRevealedDecks,
  onRefreshCards,
  elementToScrollToId,
}: HomeFeedProps) {
  const { height } = useWindowSize();
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const list = useMemo<Array<any>>(
    () => [
      ...unansweredDailyQuestions.map((q) => ({
        ...q,
        elementType: ElementType.Question,
      })),
      ...unansweredUnrevealedQuestions.map((q) => ({
        ...q,
        elementType: ElementType.Question,
      })),
      ...unansweredUnrevealedDecks.map((d) => ({
        ...d,
        elementType: ElementType.Deck,
      })),
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
      unansweredDailyQuestions,
      unansweredUnrevealedQuestions,
      unansweredUnrevealedDecks,
      answeredUnrevealedQuestions,
      answeredUnrevealedDecks,
      answeredRevealedQuestions,
      answeredRevealedDecks,
    ]
  );

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
      ref={virtuosoRef}
      style={{ height: height - SIZE_OF_OTHER_ELEMENTS_ON_HOME_SCREEN }}
      data={list}
      className="mx-4 mt-4"
      itemContent={(_, element) => (
        <div className="pb-4">
          <FeedRowCard
            element={element}
            type={element.elementType}
            onRefreshCards={onRefreshCards}
          />
        </div>
      )}
    />
  );
}
