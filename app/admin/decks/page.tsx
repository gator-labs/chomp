import { Button } from "@chomp/app/components/Button/Button";
import { DeckList } from "@chomp/app/components/DeckList/DeckList";
import { getDecks } from "@chomp/app/queries/deck";
import Link from "next/link";

export default async function Page() {
  const decks = await getDecks();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-2">
        <Link href="/admin/decks/import">
          <Button variant="primary">Import</Button>
        </Link>
        <Link href="/admin/decks/new">
          <Button variant="primary">New</Button>
        </Link>
      </div>

      <DeckList decks={decks} />
    </div>
  );
}
