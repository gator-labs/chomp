import { Deck, Question } from "@/app/components/Deck/Deck";
import { getDeckDetailsById } from "@/app/queries/deck";

type PageProps = {
  params: { id: string };
};

export default async function Page({ params: { id } }: PageProps) {
  const deck = await getDeckDetailsById(+id);

  const questions = deck?.deckQuestions.map(
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
      {questions && (
        <Deck
          questions={questions}
          deckId={+id}
          browseHomeUrl="/application/answer"
        />
      )}
    </div>
  );
}
