import ComingSoonDeck from '@/app/components/ComingSoonDeck/ComingSoonDeck';
import { NoQuestionsCard } from '@/app/components/NoQuestionsCard/NoQuestionsCard';
import RevealDeck from '@/app/components/RevealDeck/RevealDeck';
import { getDeckQuestionsForAnswerById } from '@/app/queries/deck';
import { getDecksForExpiringSection } from '@/app/queries/home';
import { getStackImage } from '@/app/queries/stack';
import DeckScreen from '@/app/screens/DeckScreens/DeckScreen';

export default async function Page() {
  const [firstDeck, nextDeck] = await getDecksForExpiringSection();

  const deck = !!firstDeck
    ? await getDeckQuestionsForAnswerById(firstDeck.id)
    : null;

  const stackId = Number(deck?.stackId) || null;

  const stackData = stackId ? await getStackImage(stackId) : null;

  return (
    <div className="flex justify-center items-center h-full w-full">
      {deck === null ? (
        <NoQuestionsCard variant={'regular-deck'} nextDeckId={nextDeck?.id} />
      ) : deck.revealAtDate &&
        deck.revealAtDate < new Date() &&
        deck.deckInfo ? (
        <RevealDeck
          deckId={firstDeck.id}
          deckTitle={deck.deckInfo.heading}
          deckDescription={deck.deckInfo.description}
          deckFooter={deck.deckInfo.footer}
          deckImage={deck.deckInfo.imageUrl || stackData?.image}
          numberOfQuestions={deck.totalDeckQuestions}
        />
      ) : deck.questions?.length > 0 && !!deck && !!deck.deckInfo ? (
        <DeckScreen
          currentDeckId={deck.id}
          nextDeckId={nextDeck?.id}
          questions={deck.questions}
          stackImage={stackData?.image ?? ''}
          deckInfo={{
            heading: deck.deckInfo.heading!,
            footer: deck.deckInfo.footer,
            description: deck.deckInfo.description,
            imageUrl: deck.deckInfo.imageUrl,
            totalNumberOfQuestions: deck.questions.length,
          }}
          numberOfUserAnswers={deck.numberOfUserAnswers!}
        />
      ) : deck.questions.length === 0 ? (
        <NoQuestionsCard variant={'regular-deck'} nextDeckId={nextDeck?.id} />
      ) : (
        <ComingSoonDeck deckName={deck?.name} />
      )}
    </div>
  );
}
