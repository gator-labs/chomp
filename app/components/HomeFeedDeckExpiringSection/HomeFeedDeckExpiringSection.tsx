"use client";

import { DeckExpiringSoon } from "@/app/queries/home";
import { useRouter } from "next/navigation";
import { HomeFeedCardCarousel } from "../HomeFeedCardsCarousel/HomeFeedCardsCarousel";
import { HomeFeedDeckCard } from "../HomeFeedDeckCard/HomeFeedDeckCard";

type HomeFeedDeckExpiringSectionProps = {
  decks: DeckExpiringSoon[];
};

export function HomeFeedDeckExpiringSection({
  decks,
}: HomeFeedDeckExpiringSectionProps) {
  const router = useRouter();
  if (decks.length === 0) {
    return null;
  }

  const deckSlides = decks.map((d) => (
    <HomeFeedDeckCard
      key={d.id}
      deck={d.deck}
      answerCount={d.answerCount}
      revealAtAnswerCount={d.revealAtAnswerCount}
      revealAtDate={d.revealAtDate}
      status="new"
      onClick={() => {
        router.push("application/answer/deck/" + d.id);
        router.refresh();
      }}
    />
  ));

  return (
    <HomeFeedCardCarousel
      className="mt-6"
      title={
        <span className="text-base text-chomp-purple">Expiring soon!</span>
      }
      slides={deckSlides}
    />
  );
}
