import { getJwtPayload } from "@/app/actions/jwt";
import ComingSoonDeck from "@/app/components/ComingSoonDeck/ComingSoonDeck";
import { NoQuestionsCard } from "@/app/components/NoQuestionsCard/NoQuestionsCard";
import NotActiveDeck from "@/app/components/NotActiveDeck/NotActiveDeck";
import RevealDeck from "@/app/components/RevealDeck/RevealDeck";
import {
  getCreditFreeDeckId,
  getDeckForLoggedOutUsers,
  getDeckQuestionsForAnswerById,
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

  let deckIn;
  let deckOut;
  if (isUserLoggedIn) {
    deckIn = await getDeckQuestionsForAnswerById(currentDeckId);
  } else {
    deckOut = await getDeckForLoggedOutUsers(currentDeckId);
  }

  const anyDeck = deckIn || deckOut;

  const stackId = Number(anyDeck?.stackId) || null;

  const stackData = stackId ? await getStackImage(stackId) : null;

  const nextDeckId = isUserLoggedIn
    ? await getNextDeckId(currentDeckId, stackId)
    : undefined;

  const freeExpiringDeckId = isUserLoggedIn
    ? await getCreditFreeDeckId()
    : null;

  const totalCredits = isUserLoggedIn ? await getUserTotalCreditAmount() : 0;

  let blurData;
  const imgUrl = anyDeck?.deckInfo?.imageUrl || stackData?.image;

  const FF_CREDITS = !!process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION;

  if (imgUrl) {
    blurData = await getBlurData(imgUrl);
  }

  if (!isUserLoggedIn) {
    if (!deckOut) {
      // Deck does not exists
      notFound();
    }

    // Only show active decks that are not revealed yet
    return (
      <div className="h-full pt-3 pb-4">
        <DeckScreen
          currentDeckId={deckOut.id}
          nextDeckId={nextDeckId}
          questions={deckOut.questions}
          stackImage={stackData?.image ?? ""}
          deckInfo={{
            ...deckOut.deckInfo,
            totalNumberOfQuestions: deckOut.totalDeckQuestions,
          }}
          numberOfUserAnswers={0}
          totalCredits={totalCredits}
          deckCreditCost={deckOut?.deckCreditCost}
          deckRewardAmount={deckOut?.deckRewardAmount ?? 0}
          freeExpiringDeckId={freeExpiringDeckId?.id ?? null}
          blurData={blurData?.base64}
        />
      </div>
    );
  }

  return (
    <div className="h-full pt-3 pb-4">
      {deckIn === null ? (
        // There were not questions unanswered so we show "You finished the deck"
        // TODO: this also causes that 404 decks show as finished
        <NoQuestionsCard variant={"regular-deck"} nextDeckId={nextDeckId} />
      ) : deckIn!.revealAtDate &&
        deckIn!.revealAtDate < new Date() &&
        deckIn!.deckInfo ? (
        FF_CREDITS ? (
          <RevealDeckNew
            deckId={currentDeckId}
            deckTitle={deckIn!.deckInfo.heading}
            deckDescription={deckIn!.deckInfo.description}
            deckFooter={deckIn!.deckInfo.footer}
            deckImage={deckIn!.deckInfo.imageUrl || stackData?.image}
            numberOfQuestions={deckIn!.totalDeckQuestions}
          />
        ) : (
          <RevealDeck
            deckId={currentDeckId}
            deckTitle={deckIn!.deckInfo.heading}
            deckDescription={deckIn!.deckInfo.description}
            deckFooter={deckIn!.deckInfo.footer}
            deckImage={deckIn!.deckInfo.imageUrl || stackData?.image}
            numberOfQuestions={deckIn!.totalDeckQuestions}
          />
        )
      ) : deckIn!.questions?.length > 0 && deckIn!.deckInfo ? (
        // you have unanswered questions
        <DeckScreen
          currentDeckId={deckIn!.id}
          nextDeckId={nextDeckId}
          questions={deckIn!.questions}
          stackImage={stackData?.image ?? ""}
          deckInfo={{
            ...deckIn!.deckInfo!,
            totalNumberOfQuestions: deckIn!.questions.length,
          }}
          numberOfUserAnswers={deckIn!.numberOfUserAnswers!}
          totalCredits={totalCredits}
          deckCreditCost={deckIn!.deckCreditCost}
          deckRewardAmount={deckIn?.deckRewardAmount ?? 0}
          freeExpiringDeckId={freeExpiringDeckId?.id ?? null}
          blurData={blurData?.base64}
        />
      ) : deckIn!.questions.length === 0 ? (
        <NoQuestionsCard variant={"regular-deck"} nextDeckId={nextDeckId} />
      ) : deckIn!.activeFromDate && deckIn!.activeFromDate > new Date() ? (
        // Deck is not yet available, we show remaining time left
        <NotActiveDeck
          deckName={deckIn!.name}
          deckInfo={deckIn!.deckInfo}
          stackImage={stackData?.image}
          totalNumberOfQuestions={deckIn!.totalDeckQuestions}
          activeFrom={deckIn!.activeFromDate}
          deckCreditCost={deckIn!.deckCreditCost}
          blurData={blurData?.base64}
          totalCredits={totalCredits}
          deckRewardAmount={deckIn?.deckRewardAmount ?? 0}
        />
      ) : (
        // deck created but not scheduled yet?
        <ComingSoonDeck deckName={deckIn?.name} />
      )}
    </div>
  );
}
