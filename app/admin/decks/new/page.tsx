import { createDeck } from "@/app/actions/deck";
import DeckForm from "@/app/components/DeckForm/DeckForm";
import { getTags } from "@/app/queries/tag";

export default async function Page() {
  const tags = await getTags();

  return <DeckForm action={createDeck} tags={tags} />;
}
