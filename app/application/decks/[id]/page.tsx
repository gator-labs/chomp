import { Deck } from "@/app/components/Deck/Deck";
import { NoQuestionsCard } from "@/app/components/NoQuestionsCard/NoQuestionsCard";
import { getDeckQuestionsForAnswerById } from "@/app/queries/deck";
import { getDecksForExpiringSection } from "@/app/queries/home";

type PageProps = {
  params: { id: string };
};

export default async function Page({ params: { id } }: PageProps) {
  const currentDeckId = Number(id);

  const deck = await getDeckQuestionsForAnswerById(currentDeckId);

  const decks = await getDecksForExpiringSection();
  const nextDeck = decks.filter((deck) => deck.id !== currentDeckId)?.[0];

  return (
    <div className="h-full py-2">
      {!deck?.questions.length ? (
        <div className="flex flex-col justify-evenly h-full pb-4">
          <NoQuestionsCard variant={"regular-deck"} nextDeckId={nextDeck?.id} />
        </div>
      ) : (
        <Deck
          questions={deck.questions}
          deckId={currentDeckId}
          nextDeckId={nextDeck?.id}
          deckVariant="regular-deck"
        />
      )}
    </div>
  );
}
