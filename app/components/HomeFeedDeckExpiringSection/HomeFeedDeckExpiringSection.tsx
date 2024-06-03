"use client";

import { DeckExpiringSoon } from "@/app/queries/home";
import { useRouter } from "next/navigation";
import { HomeFeedCardCarousel } from "../HomeFeedCardsCarousel/HomeFeedCardsCarousel";
import { HomeFeedDeckCard } from "../HomeFeedDeckCard/HomeFeedDeckCard";
import { HomeFeedEmptyQuestionCard } from "../HomeFeedEmptyQuestionCard/HomeFeedEmptyQuestionCard";

type HomeFeedDeckExpiringSectionProps = {
  decks: DeckExpiringSoon[];
};

export function HomeFeedDeckExpiringSection({
  decks,
}: HomeFeedDeckExpiringSectionProps) {
  const router = useRouter();

  console.log("test");

  const deckSlides = !!decks.length
    ? decks.map((d) => (
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
      ))
    : [<HomeFeedEmptyQuestionCard key={0} />];

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
