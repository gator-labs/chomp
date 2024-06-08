import { createDeck } from "@chomp/app/actions/deck/deck";
import DeckForm from "@chomp/app/components/DeckForm/DeckForm";
import { getTags } from "@chomp/app/queries/tag";

export default async function Page() {
  const tags = await getTags();

  return <DeckForm action={createDeck} tags={tags} />;
}
