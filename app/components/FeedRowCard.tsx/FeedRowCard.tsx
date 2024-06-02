"use client";
import { ElementType } from "@/app/queries/question";
import { DeckQuestionIncludes } from "@/app/utils/question";
import { ChompResult, Deck, Question } from "@prisma/client";
import { DeckRowCard } from "../DeckRowCard/DeckRowCard";
import { QuestionRowCard } from "../QuestionRowCard/QuestionRowCard";

type FeedRowCardProps = {
  element: Deck | Question;
  type: ElementType;
  deckReturnUrl?: string;
  onRefreshCards: (revealedId: number) => void;
};

export function FeedRowCard({
  element,
  type,
  deckReturnUrl,
  onRefreshCards,
}: FeedRowCardProps) {
  if (type === ElementType.Question) {
    return (
      <QuestionRowCard
        question={element as DeckQuestionIncludes}
        onRefreshCards={onRefreshCards}
      />
    );
  }

  return (
    <DeckRowCard
      deck={
        element as Deck & {
          deckQuestions: {
            question: DeckQuestionIncludes;
          }[];
          chompResults: ChompResult[];
        }
      }
      deckReturnUrl={deckReturnUrl}
    />
  );
}
