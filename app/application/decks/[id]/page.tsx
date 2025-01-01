import ComingSoonDeck from "@/app/components/ComingSoonDeck/ComingSoonDeck";
import { NoQuestionsCard } from "@/app/components/NoQuestionsCard/NoQuestionsCard";
import RevealDeck from "@/app/components/RevealDeck/RevealDeck";
import {
  getCreditFreeDeckId,
  getDeckQuestionsForAnswerById,
} from "@/app/queries/deck";
import { getNextDeckId, getUserTotalCreditAmount } from "@/app/queries/home";
import { getStackImage } from "@/app/queries/stack";
import ClientDeckWrapper from "@/app/screens/DeckScreens/ClientDeckWrapper";

type PageProps = {
  params: { id: string };
};

export default async function Page({ params: { id } }: PageProps) {
  const currentDeckId = Number(id);
  const deck = await getDeckQuestionsForAnswerById(currentDeckId);

  const stackId = Number(deck?.stackId) || null;

  const stackData = stackId ? await getStackImage(stackId) : null;

  const nextDeckId = await getNextDeckId(currentDeckId, stackId);

  const freeExpiringDeckId = await getCreditFreeDeckId();

  const credits = await getUserTotalCreditAmount();
  return (
    <div className="h-full pt-3 pb-4">
      {deck === null ? (
        <NoQuestionsCard variant={"regular-deck"} nextDeckId={nextDeckId} />
      ) : deck.revealAtDate &&
        deck.revealAtDate < new Date() &&
        deck.deckInfo ? (
        <RevealDeck
          deckId={currentDeckId}
          deckTitle={deck.deckInfo.heading}
          deckDescription={deck.deckInfo.description}
          deckFooter={deck.deckInfo.footer}
          deckImage={deck.deckInfo.imageUrl || stackData?.image}
          numberOfQuestions={deck.totalDeckQuestions}
        />
      ) : deck.questions?.length > 0 && deck.deckInfo ? (
        <ClientDeckWrapper
          initialCredits={credits}
          currentDeckId={deck.id}
          nextDeckId={nextDeckId}
          questions={deck.questions}
          stackImage={stackData?.image ?? ""}
          deckInfo={{
            ...deck.deckInfo!,
            totalNumberOfQuestions: deck.questions.length,
          }}
          numberOfUserAnswers={deck.numberOfUserAnswers!}
          deckCost={deck?.creditsCost}
          freeExpiringDeckId={freeExpiringDeckId?.id ?? null}
        />
      ) : deck.questions.length === 0 ? (
        <NoQuestionsCard variant={"regular-deck"} nextDeckId={nextDeckId} />
      ) : (
        <ComingSoonDeck deckName={deck?.name} />
      )}
    </div>
  );
}
