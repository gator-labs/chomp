import { DeckList } from "@/app/components/DeckList/DeckList";
import { Button } from "@/app/components/ui/button";
import { getDecks } from "@/app/queries/deck";
import Link from "next/link";

export default async function Page() {
  const decks = await getDecks();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-2">
        <Link href="/admin/decks/import">
          <Button>Import</Button>
        </Link>
        <Link href="/admin/decks/new">
          <Button>New</Button>
        </Link>
      </div>

      <DeckList decks={decks} />
    </div>
  );
}
