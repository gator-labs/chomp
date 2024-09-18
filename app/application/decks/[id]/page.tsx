import ComingSoonDeck from "@/app/components/ComingSoonDeck/ComingSoonDeck";
import { NoQuestionsCard } from "@/app/components/NoQuestionsCard/NoQuestionsCard";
import { getDeckQuestionsForAnswerById } from "@/app/queries/deck";
import { getNextDeckId } from "@/app/queries/home";
import DeckScreen from "@/app/screens/DeckScreens/DeckScreen";

type PageProps = {
  params: { id: string };
};

export default async function Page({ params: { id } }: PageProps) {
  const currentDeckId = Number(id);

  const deck = await getDeckQuestionsForAnswerById(currentDeckId);

  const campaignId = Number(deck?.campaignId) || null

  const nextDeckId = await getNextDeckId(currentDeckId, campaignId);

  return (
    <div className="h-full pt-3 pb-4">
      {deck?.questions.length === 0 || deck === null ? (
        <NoQuestionsCard variant={"regular-deck"} nextDeckId={nextDeckId} />
      ) : deck?.questions && deck?.questions?.length > 0 && deck?.deckInfo ? (
        <DeckScreen
          currentDeckId={deck.id}
          nextDeckId={nextDeckId}
          questions={deck.questions}
          deckInfo={{
            ...deck.deckInfo!,
            totalNumberOfQuestions: deck.questions.length,
          }}
          numberOfUserAnswers={deck.numberOfUserAnswers!}
        />
      ) : (
        <ComingSoonDeck deckName={deck?.name} />
      )}
    </div>
  );
}
