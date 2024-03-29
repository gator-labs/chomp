import { Deck, Question } from "@/app/components/Deck/Deck";
import { getDailyDeck } from "@/app/queries/deck";
import { DailyDeckTitle } from "../components/DailyDeckTitle/DailyDeckTitle";

export default async function Page() {
  const dailyDeck = await getDailyDeck();

  const questions = dailyDeck?.deckQuestions.map(
    (dq) =>
      ({
        id: dq.questionId,
        durationMiliseconds: Number(dq.question.durationMiliseconds),
        question: dq.question.question,
        type: dq.question.type,
        questionOptions: dq.question.questionOptions.map((qo) => ({
          id: qo.id,
          option: qo.option,
        })),
      }) satisfies Question
  );

  return (
    <div className="h-full p-2">
      <div className="px-4 py-5">
        <DailyDeckTitle date={dailyDeck?.date ?? new Date()} />
      </div>
      <div className="px-4">
        {questions && (
          <Deck
            questions={questions}
            deckId={dailyDeck?.id ?? 0}
            browseHomeUrl="/application/answer"
          />
        )}
      </div>
    </div>
  );
}
