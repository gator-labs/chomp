"use client";
import { Deck, Question, Reveal } from "@prisma/client";
import { QuestionRowCard } from "../QuestionRowCard/QuestionRowCard";
import { DeckQuestionIncludes } from "../DeckDetails/DeckDetails";
import { DeckRowCard } from "../DeckRowCard/DeckRowCard";

type FeedRowCardProps = {
  element: Deck | Question;
  type: ElementType;
};

export enum ElementType {
  Question,
  Deck,
}

export function FeedRowCard({ element, type }: FeedRowCardProps) {
  if (type === ElementType.Question) {
    return <QuestionRowCard question={element as DeckQuestionIncludes} />;
  }

  return (
    <DeckRowCard
      deck={
        element as Deck & {
          deckQuestions: {
            question: DeckQuestionIncludes;
          }[];
          reveals: Reveal[];
        }
      }
    />
  );
}
