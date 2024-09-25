import ComingSoonDeck from "@/app/components/ComingSoonDeck/ComingSoonDeck";
import { NoQuestionsCard } from "@/app/components/NoQuestionsCard/NoQuestionsCard";
import RevealDeck from "@/app/components/RevealDeck/RevealDeck";
import { getCampaignImage } from "@/app/queries/campaign";
import { getDeckQuestionsForAnswerById } from "@/app/queries/deck";
import { getNextDeckId } from "@/app/queries/home";
import DeckScreen from "@/app/screens/DeckScreens/DeckScreen";

type PageProps = {
  params: { id: string };
};

export default async function Page({ params: { id } }: PageProps) {
  const currentDeckId = Number(id);
  const deck = await getDeckQuestionsForAnswerById(currentDeckId);

  const campaignId = Number(deck?.campaignId) || null;

  const campaignData = campaignId ? await getCampaignImage(campaignId) : null;

  const nextDeckId = await getNextDeckId(currentDeckId, campaignId);

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
          deckImage={deck.deckInfo.imageUrl || campaignData?.image}
          numberOfQuestions={deck.totalDeckQuestions}
        />
      ) : deck.questions?.length > 0 && deck.deckInfo ? (
        <DeckScreen
          currentDeckId={deck.id}
          nextDeckId={nextDeckId}
          questions={deck.questions}
          campaignImage={campaignData?.image ?? ""}
          deckInfo={{
            ...deck.deckInfo!,
            totalNumberOfQuestions: deck.questions.length,
          }}
          numberOfUserAnswers={deck.numberOfUserAnswers!}
        />
      ) : deck.questions.length === 0 ? (
        <NoQuestionsCard variant={"regular-deck"} nextDeckId={nextDeckId} />
      ) : (
        <ComingSoonDeck deckName={deck?.name} />
      )}
    </div>
  );
}
