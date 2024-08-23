import { Deck } from "@/app/components/Deck/Deck";
import { getDeckQuestionsForAnswerById } from "@/app/queries/deck";
import { getDecksForExpiringSection } from "@/app/queries/home";
import { redirect } from "next/navigation";

type PageProps = {
  params: { id: string };
};

export default async function Page({ params: { id } }: PageProps) {
  const currentDeckId = Number(id);

  const deck = await getDeckQuestionsForAnswerById(currentDeckId);

  if (!deck?.questions.length) redirect("/application");

  const decks = await getDecksForExpiringSection();
  const nextDeck = decks.filter((deck) => deck.id !== currentDeckId)?.[0];

  return (
    <div className="h-full py-2">
      <Deck
        questions={deck.questions}
        deckId={currentDeckId}
        nextDeckId={nextDeck?.id}
        deckVariant="regular-deck"
      />
    </div>
  );
}
