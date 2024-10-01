import { createDeck } from "@/app/actions/deck/deck";
import DeckForm from "@/app/components/DeckForm/DeckForm";
import { getActiveAndInactiveStacks } from "@/app/queries/stack";
import { getTags } from "@/app/queries/tag";

export default async function Page() {
  const tags = await getTags();
  const stacks = await getActiveAndInactiveStacks();

  return <DeckForm action={createDeck} tags={tags} stacks={stacks} />;
}
