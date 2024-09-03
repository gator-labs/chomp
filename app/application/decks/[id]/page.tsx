import { NoQuestionsCard } from "@/app/components/NoQuestionsCard/NoQuestionsCard";
import { getDeckQuestionsForAnswerById } from "@/app/queries/deck";
import { getDecksForExpiringSection } from "@/app/queries/home";
import DeckScreen from "@/app/screens/DeckScreens/DeckScreen";

type PageProps = {
  params: { id: string };
};

export default async function Page({ params: { id } }: PageProps) {
  const currentDeckId = Number(id);

  const deck = await getDeckQuestionsForAnswerById(currentDeckId);

  const decks = await getDecksForExpiringSection();
  const nextDeck = decks.filter((deck) => deck.id !== currentDeckId)?.[0];

  return (
    <div className="h-full pt-3 pb-4">
      {!deck?.questions.length ? (
        <div className="flex flex-col justify-evenly h-full pb-4">
          <NoQuestionsCard variant={"regular-deck"} nextDeckId={nextDeck?.id} />
        </div>
      ) : (
        <DeckScreen
          currentDeckId={deck.id}
          nextDeckId={nextDeck?.id}
          questions={deck.questions}
          deckInfo={{
            ...deck.deckInfo!,
            totalNumberOfQuestions: deck.questions.length,
          }}
          numberOfUserAnswers={deck.numberOfUserAnswers!}
        />
      )}
    </div>
  );
}