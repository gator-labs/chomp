import { DeckQuestionIncludes, getDeckState } from "@/app/utils/question";
import { Deck, Reveal } from "@prisma/client";
import Link from "next/link";
import { QuestionDeck } from "../QuestionDeck/QuestionDeck";

type DeckRowCardProps = {
  deck: Deck & {
    answerCount?: number;
    deckQuestions: {
      question: DeckQuestionIncludes;
    }[];
    reveals: Reveal[];
  };
  deckReturnUrl?: string;
};

export function DeckRowCard({ deck, deckReturnUrl }: DeckRowCardProps) {
  const { isAnswered } = getDeckState(deck);

  if (isAnswered) {
    return (
      <Link
        href={`/application/deck/${deck.id}${deckReturnUrl ? "?returnUrl=" + deckReturnUrl : ""}`}
      >
        <QuestionDeck
          text={deck.deck}
          imageUrl={deck.imageUrl}
          revealedAt={deck.revealAtDate}
          status="chomped"
        />
      </Link>
    );
  }

  return (
    <Link href={`/application/answer/deck/${deck.id}`}>
      <QuestionDeck
        text={deck.deck}
        imageUrl={deck.imageUrl}
        revealedAt={deck.revealAtDate}
        status="new"
      />
    </Link>
  );
}
