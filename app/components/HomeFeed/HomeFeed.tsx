"use client";
import { Deck, Question } from "@prisma/client";
import { useMemo } from "react";
import { Virtuoso } from "react-virtuoso";
import { useWindowSize } from "@/app/hooks/useWindowSize";
import { HomeFeedRow } from "./HomeFeedRow";

export type HomeFeedProps = {
  unansweredDailyQuestions: Question[];
  unansweredUnrevealedQuestions: Question[];
  unansweredUnrevealedDecks: Deck[];
  answeredUnrevealedQuestions: Question[];
  answeredUnrevealedDecks: Deck[];
  answeredRevealedQuestions: Question[];
  answeredRevealedDecks: Deck[];
};

export enum ElementType {
  Question,
  Deck,
}

const SIZE_OF_OTHER_ELEMENTS_ON_HOME_SCREEN = 210;

export function HomeFeed({
  unansweredDailyQuestions,
  unansweredUnrevealedQuestions,
  unansweredUnrevealedDecks,
  answeredUnrevealedQuestions,
  answeredUnrevealedDecks,
  answeredRevealedQuestions,
  answeredRevealedDecks,
}: HomeFeedProps) {
  const { height } = useWindowSize();
  const list = useMemo<Array<any>>(
    () => [
      ...unansweredDailyQuestions.map((q) => ({
        ...q,
        elementType: ElementType.Question,
        isAnswered: false,
        isRevealed: false,
      })),
      ...unansweredUnrevealedQuestions.map((q) => ({
        ...q,
        elementType: ElementType.Question,
        isAnswered: false,
        isRevealed: false,
      })),
      ...unansweredUnrevealedDecks.map((d) => ({
        ...d,
        elementType: ElementType.Deck,
        isAnswered: false,
        isRevealed: false,
      })),
      ...answeredUnrevealedQuestions.map((q) => ({
        ...q,
        elementType: ElementType.Question,
        isAnswered: true,
        isRevealed: false,
      })),
      ...answeredUnrevealedDecks.map((d) => ({
        ...d,
        elementType: ElementType.Deck,
        isAnswered: true,
        isRevealed: false,
      })),
      ...answeredRevealedQuestions.map((q) => ({
        ...q,
        elementType: ElementType.Question,
        isAnswered: true,
        isRevealed: true,
      })),
      ...answeredRevealedDecks.map((d) => ({
        ...d,
        elementType: ElementType.Deck,
        isAnswered: true,
        isRevealed: true,
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

  return (
    <Virtuoso
      style={{ height: height - SIZE_OF_OTHER_ELEMENTS_ON_HOME_SCREEN }}
      data={list}
      className="mx-4 mt-4"
      itemContent={(_, element) => (
        <div className="pb-4">
          <HomeFeedRow
            element={element}
            type={element.elementType}
            isAnswered={element.isAnswered}
            isRevealed={element.isRevealed}
          />
        </div>
      )}
    />
  );
}
