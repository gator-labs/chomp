import { Deck } from "@/app/components/Deck/Deck";
import {
  getDeckQuestionsForAnswerById,
  hasAnsweredDeck,
} from "@/app/queries/deck";
import { getDecksForExpiringSection } from "@/app/queries/home";
import dayjs from "dayjs";
import { redirect } from "next/navigation";

type PageProps = {
  params: { id: string };
};

export default async function Page({ params: { id } }: PageProps) {
  const currentDeckId = Number(id);
  const hasAnswered = await hasAnsweredDeck(currentDeckId, null, true);

  if (hasAnswered) {
    return redirect("/application");
  }

  const questions = await getDeckQuestionsForAnswerById(currentDeckId);

  if (
    !questions ||
    dayjs(questions[0]?.deckRevealAtDate).isBefore(new Date())
  ) {
    return redirect("/application");
  }

  const decks = await getDecksForExpiringSection();
  const nextDeck = decks.filter((deck) => deck.id !== currentDeckId)?.[0];

  return (
    <div className="h-full py-2">
      {questions && (
        <Deck
          questions={questions}
          deckId={currentDeckId}
          nextDeckId={nextDeck?.id}
          deckVariant="regular-deck"
        />
      )}
    </div>
  );
}
