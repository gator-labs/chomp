import { getJwtPayload } from "@/app/actions/jwt";
import ComingSoonDeck from "@/app/components/ComingSoonDeck/ComingSoonDeck";
import { NoQuestionsCard } from "@/app/components/NoQuestionsCard/NoQuestionsCard";
import NotActiveDeck from "@/app/components/NotActiveDeck/NotActiveDeck";
import {
  getActiveDeckForLoggedOutUsers,
  getCreditFreeDeckId,
  getDeckQuestionsForAnswerById,
  getRawDeck,
} from "@/app/queries/deck";
import { getNextDeckId, getUserTotalCreditAmount } from "@/app/queries/home";
import { getStackImage } from "@/app/queries/stack";
import DeckScreen from "@/app/screens/DeckScreens/DeckScreen";
import { getBlurData } from "@/app/utils/getBlurData";
import RevealDeckNew from "@/components/RevealDeckNew/RevealDeck";
import { notFound } from "next/navigation";

type PageProps = {
  params: { id: string };
};

export default async function Page({ params: { id } }: PageProps) {
  const payload = await getJwtPayload();
  const isUserLoggedIn = !!payload?.sub;

  const currentDeckId = Number(id);

  if (!Number.isSafeInteger(currentDeckId)) {
    notFound();
  }

  const deck = await getRawDeck(currentDeckId);

  const stackId = Number(deck?.stackId) || null;
  const stackData = stackId ? await getStackImage(stackId) : null;

  let nextDeckId;
  let freeExpiringDeckId;
  let totalCredits = 0;
  if (isUserLoggedIn) {
    nextDeckId = await getNextDeckId(currentDeckId, stackId);
    freeExpiringDeckId = await getCreditFreeDeckId();
    totalCredits = await getUserTotalCreditAmount();
  }

  let blurData;
  const imgUrl = deck?.imageUrl || stackData?.image;
  if (imgUrl) {
    blurData = await getBlurData(imgUrl);
  }

  if (!isUserLoggedIn) {
    const hydratedDeck = await getActiveDeckForLoggedOutUsers(currentDeckId);

    if (!hydratedDeck) {
      // Deck does not exist or we are not showing it to logged out users
      notFound();
    }

    // Only show active decks that are not revealed yet
    return (
      <div className="h-full pt-3 pb-4">
        <DeckScreen
          currentDeckId={hydratedDeck.id}
          nextDeckId={nextDeckId}
          questions={hydratedDeck.questions}
          stackImage={stackData?.image ?? ""}
          deckInfo={{
            ...hydratedDeck.deckInfo,
            totalNumberOfQuestions: hydratedDeck.totalDeckQuestions,
          }}
          authors={hydratedDeck.authors}
          numberOfUserAnswers={0}
          totalCredits={totalCredits}
          deckCreditCost={hydratedDeck.deckCreditCost}
          deckRewardAmount={hydratedDeck.deckRewardAmount ?? 0}
          freeExpiringDeckId={freeExpiringDeckId?.id ?? null}
          blurData={blurData?.base64}
        />
      </div>
    );
  }

  // User is logged in

  const hydratedDeck = await getDeckQuestionsForAnswerById(currentDeckId);
  return (
    <div className="h-full pt-3 pb-4">
      {hydratedDeck === null ? (
        // There were not questions unanswered so we show "You finished the deck"
        // TODO: this also causes that 404 decks show as finished
        <NoQuestionsCard variant={"regular-deck"} nextDeckId={nextDeckId} />
      ) : hydratedDeck!.revealAtDate &&
        hydratedDeck!.revealAtDate < new Date() &&
        hydratedDeck!.deckInfo ? (
        <RevealDeckNew
          deckId={currentDeckId}
          deckTitle={hydratedDeck!.deckInfo.heading}
          deckDescription={hydratedDeck!.deckInfo.description}
          deckFooter={hydratedDeck!.deckInfo.footer}
          deckImage={hydratedDeck!.deckInfo.imageUrl || stackData?.image}
          numberOfQuestions={hydratedDeck!.totalDeckQuestions}
        />
      ) : hydratedDeck!.questions?.length > 0 && hydratedDeck!.deckInfo ? (
        // you have unanswered questions
        <DeckScreen
          currentDeckId={hydratedDeck!.id}
          nextDeckId={nextDeckId}
          questions={hydratedDeck!.questions}
          stackImage={stackData?.image ?? ""}
          deckInfo={{
            ...hydratedDeck!.deckInfo!,
            totalNumberOfQuestions: hydratedDeck!.questions.length,
          }}
          authors={hydratedDeck!.authors}
          numberOfUserAnswers={hydratedDeck!.numberOfUserAnswers!}
          totalCredits={totalCredits}
          deckCreditCost={hydratedDeck!.deckCreditCost}
          deckRewardAmount={hydratedDeck?.deckRewardAmount ?? 0}
          freeExpiringDeckId={freeExpiringDeckId?.id ?? null}
          blurData={blurData?.base64}
        />
      ) : hydratedDeck!.questions.length === 0 ? (
        <NoQuestionsCard variant={"regular-deck"} nextDeckId={nextDeckId} />
      ) : hydratedDeck!.activeFromDate &&
        hydratedDeck!.activeFromDate > new Date() ? (
        // Deck is not yet available, we show remaining time left
        <NotActiveDeck
          deckName={hydratedDeck!.name}
          deckInfo={hydratedDeck!.deckInfo}
          stackImage={stackData?.image}
          totalNumberOfQuestions={hydratedDeck!.totalDeckQuestions}
          activeFrom={hydratedDeck!.activeFromDate}
          deckCreditCost={hydratedDeck!.deckCreditCost}
          blurData={blurData?.base64}
          totalCredits={totalCredits}
          deckRewardAmount={hydratedDeck?.deckRewardAmount ?? 0}
        />
      ) : (
        <ComingSoonDeck deckName={hydratedDeck?.name} />
      )}
    </div>
  );
}
