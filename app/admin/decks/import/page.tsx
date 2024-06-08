import { handleInsertDecks } from "@chomp/app/actions/deck/deck";
import { ImportDeck } from "@chomp/app/components/ImportDeck/ImportDeck";

export default async function Page() {
  return <ImportDeck action={handleInsertDecks} />;
}
