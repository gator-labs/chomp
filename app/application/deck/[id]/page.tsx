import DeckDetails from "@/app/components/DeckDetails/DeckDetails";
import { getDeckDetails } from "@/app/queries/deck";
import { redirect } from "next/navigation";

type PageProps = {
  params: { id: string };
};

export default async function Page({ params: { id } }: PageProps) {
  const deck = await getDeckDetails(+id);

  if (!deck) {
    return redirect("/application");
  }

  return (
    <div className="h-full p-2">
      <DeckDetails deck={deck} />
    </div>
  );
}
