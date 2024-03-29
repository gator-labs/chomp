import { Deck } from "@/app/components/Deck/Deck";
import { getDeckQuestionsById } from "@/app/queries/deck";

type PageProps = {
  params: { id: string };
};

export default async function Page({ params: { id } }: PageProps) {
  const questions = await getDeckQuestionsById(+id);

  return (
    <div className="h-full p-2">
      {questions && (
        <Deck questions={questions} deckId={+id} browseHomeUrl="/application" />
      )}
    </div>
  );
}
