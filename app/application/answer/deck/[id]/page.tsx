import { Deck } from "@/app/components/Deck/Deck";
import {
  getDeckQuestionsForAnswerById,
  hasAnsweredDeck,
} from "@/app/queries/deck";
import dayjs from "dayjs";
import { redirect } from "next/navigation";

type PageProps = {
  params: { id: string };
};

export default async function Page({ params: { id } }: PageProps) {
  const hasAnswered = await hasAnsweredDeck(+id, null, true);

  if (hasAnswered) {
    return redirect("/application");
  }

  const questions = await getDeckQuestionsForAnswerById(+id);

  if (
    !questions ||
    dayjs(questions[0]?.deckRevealAtDate).isBefore(new Date())
  ) {
    return redirect("/application");
  }

  return (
    <div className="h-full py-2">
      {questions && (
        <Deck questions={questions} deckId={+id} deckVariant="regular-deck" />
      )}
    </div>
  );
}
