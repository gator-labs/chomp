import { Deck, Question } from "@/app/components/Deck/Deck";
import { getDailyDeck } from "@/app/queries/deck";
import { DailyDeckTitle } from "../components/DailyDeckTitle/DailyDeckTitle";
import { NoQuestionsCard } from "../components/NoQuestionsCard/NoQuestionsCard";

export default async function Page() {
  const dailyDeck = await getDailyDeck();

  return (
    <div className="flex flex-col h-full p-2">
      <div className="px-4 py-5">
        <DailyDeckTitle date={dailyDeck?.date ?? new Date()} />
      </div>
      <div className="px-4 h-full">
        {dailyDeck?.questions ? (
          <Deck
            questions={dailyDeck.questions}
            deckId={dailyDeck.id}
            browseHomeUrl="/application"
          />
        ) : (
          <NoQuestionsCard browseHomeUrl="/application" />
        )}
      </div>
    </div>
  );
}
