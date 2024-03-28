import { Deck, Question } from "@/app/components/Deck/Deck";
import { getDeckDetailsById } from "@/app/queries/deck";

type PageProps = {
  params: { id: string };
};

export default async function Page({ params: { id } }: PageProps) {
  const deck = await getDeckDetailsById(+id);

  const questions = deck?.questionDecks.map(
    (qd) =>
      ({
        id: qd.questionId,
        durationMiliseconds: Number(qd.question.durationMiliseconds),
        question: qd.question.question,
        type: qd.question.type,
        questionOptions: qd.question.questionOptions.map((qo) => ({
          id: qo.id,
          option: qo.option,
        })),
      }) satisfies Question
  );

  return (
    <div className="h-full p-2">
      {questions && (
        <Deck questions={questions} browseHomeUrl="/application/answer" />
      )}
    </div>
  );
}
