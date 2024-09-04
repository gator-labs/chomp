import { getDecksForExpiringSection } from "@/app/queries/home";
import { HomeFeedCardCarousel } from "../HomeFeedCardsCarousel/HomeFeedCardsCarousel";
import { HomeFeedDeckCard } from "../HomeFeedDeckCard/HomeFeedDeckCard";
import { HomeFeedEmptyQuestionCard } from "../HomeFeedEmptyQuestionCard/HomeFeedEmptyQuestionCard";

export async function HomeFeedDeckExpiringSection() {
  const decks = await getDecksForExpiringSection();

  const deckSlides = !!decks.length
    ? decks.map((d) => (
        <HomeFeedDeckCard
          imageUrl={d.image}
          key={d.id}
          deck={d.deck}
          deckId={d.id}
          answerCount={d.answerCount}
          revealAtAnswerCount={d.revealAtAnswerCount}
          revealAtDate={d.revealAtDate}
          status="new"
        />
      ))
    : [
        <HomeFeedEmptyQuestionCard
          title="That’s all for now!"
          description="Come back later to see new suggested questions here"
          key={0}
        />,
      ];

  return (
    <HomeFeedCardCarousel
      className="mt-6"
      title={<span className="text-base text-purple-500">Expiring soon!</span>}
      slides={deckSlides}
    />
  );
}
