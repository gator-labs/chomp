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
  const hasAnswered = await hasAnsweredDeck(+id);

  console.log({ hasAnswered });

  if (hasAnswered) {
    console.log("in first redirect");
    return redirect("/application");
  }

  const questions = await getDeckQuestionsForAnswerById(+id);

  if (
    !questions ||
    dayjs(questions[0]?.deckRevealAtDate).isBefore(new Date())
  ) {
    console.log("in second redirect");
    return redirect("/application");
  }

  return (
    <div className="max-h-[calc(100%-48px)] py-2">
      {questions && (
        <Deck questions={questions} deckId={+id} deckVariant="regular-deck" />
      )}
    </div>
  );
}
