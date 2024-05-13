import { handleInsertDecks } from "@/app/actions/deck/deck";
import { ImportDeck } from "@/app/components/ImportDeck/ImportDeck";

export default async function Page() {
  return <ImportDeck action={handleInsertDecks} />;
}
