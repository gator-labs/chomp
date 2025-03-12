import { getJwtPayload } from "@/app/actions/jwt";
import ComingSoonDeck from "@/app/components/ComingSoonDeck/ComingSoonDeck";
import { NoQuestionsCard } from "@/app/components/NoQuestionsCard/NoQuestionsCard";
import NotActiveDeck from "@/app/components/NotActiveDeck/NotActiveDeck";
import RevealDeck from "@/app/components/RevealDeck/RevealDeck";
import {
  getCreditFreeDeckId,
  getDeckQuestionsForAnswerById,
} from "@/app/queries/deck";
import { getNextDeckId, getUserTotalCreditAmount } from "@/app/queries/home";
import { getStackImage } from "@/app/queries/stack";
import DeckScreen from "@/app/screens/DeckScreens/DeckScreen";
import { getBlurData } from "@/app/utils/getBlurData";
import RevealDeckNew from "@/components/RevealDeckNew/RevealDeck";

type PageProps = {
  params: { id: string };
};

export default async function Page({ params: { id } }: PageProps) {
  const payload = await getJwtPayload();
  const isUserLoggedIn = !!payload?.sub;

  const currentDeckId = Number(id);
  const deck = await getDeckQuestionsForAnswerById(currentDeckId);

  const stackId = Number(deck?.stackId) || null;

  const stackData = stackId ? await getStackImage(stackId) : null;

  const nextDeckId = isUserLoggedIn ? await getNextDeckId(currentDeckId, stackId) : undefined;

  const freeExpiringDeckId = isUserLoggedIn ? await getCreditFreeDeckId() : null;

  const totalCredits = isUserLoggedIn ? await getUserTotalCreditAmount() : null;

  let blurData;
  const imgUrl = deck?.deckInfo?.imageUrl || stackData?.image;

  const FF_CREDITS = !!process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION;

  if (imgUrl) {
    blurData = await getBlurData(imgUrl);
  }

  return (
    <div className="h-full pt-3 pb-4">
      {deck === null ? (
        <NoQuestionsCard variant={"regular-deck"} nextDeckId={nextDeckId} />
      ) : deck.revealAtDate &&
        deck.revealAtDate < new Date() &&
        deck.deckInfo ? (
        FF_CREDITS ? (
          <RevealDeckNew
            deckId={currentDeckId}
            deckTitle={deck.deckInfo.heading}
            deckDescription={deck.deckInfo.description}
            deckFooter={deck.deckInfo.footer}
            deckImage={deck.deckInfo.imageUrl || stackData?.image}
            numberOfQuestions={deck.totalDeckQuestions}
          />
        ) : (
          <RevealDeck
            deckId={currentDeckId}
            deckTitle={deck.deckInfo.heading}
            deckDescription={deck.deckInfo.description}
            deckFooter={deck.deckInfo.footer}
            deckImage={deck.deckInfo.imageUrl || stackData?.image}
            numberOfQuestions={deck.totalDeckQuestions}
          />
        )
      ) : deck.questions?.length > 0 && deck.deckInfo ? (
        <DeckScreen
          currentDeckId={deck.id}
          nextDeckId={nextDeckId}
          questions={deck.questions}
          stackImage={stackData?.image ?? ""}
          deckInfo={{
            ...deck.deckInfo!,
            totalNumberOfQuestions: deck.questions.length,
          }}
          numberOfUserAnswers={deck.numberOfUserAnswers!}
          totalCredits={totalCredits}
          deckCreditCost={deck?.deckCreditCost}
          deckRewardAmount={deck?.deckRewardAmount ?? 0}
          freeExpiringDeckId={freeExpiringDeckId?.id ?? null}
          blurData={blurData?.base64}
        />
      ) : deck.questions.length === 0 ? (
        <NoQuestionsCard variant={"regular-deck"} nextDeckId={nextDeckId} />
      ) : deck.activeFromDate && deck.activeFromDate > new Date() ? (
        <NotActiveDeck
          deckName={deck.name}
          deckInfo={deck.deckInfo}
          stackImage={stackData?.image}
          totalNumberOfQuestions={deck.totalDeckQuestions}
          activeFrom={deck.activeFromDate}
          deckCreditCost={deck?.deckCreditCost}
          blurData={blurData?.base64}
          totalCredits={totalCredits}
          deckRewardAmount={deck?.deckRewardAmount ?? 0}
        />
      ) : (
        <ComingSoonDeck deckName={deck?.name} />
      )}
    </div>
  );
}
