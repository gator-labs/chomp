import { editDeck } from "@/app/actions/deck/deck";
import DeckForm from "@/app/components/DeckForm/DeckForm";
import { getDeckSchema } from "@/app/queries/deck";
import { getTags } from "@/app/queries/tag";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function Page({ params: { id } }: PageProps) {
  const deck = await getDeckSchema(+id);
  const tags = await getTags();

  if (!deck) {
    return notFound();
  }

  return <DeckForm action={editDeck} deck={deck} tags={tags} />;
}
