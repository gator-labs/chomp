import DeckDetails from "@/app/components/DeckDetails/DeckDetails";
import { getDeckDetails } from "@/app/queries/deck";
import { redirect } from "next/navigation";

type PageProps = {
  params: { id: string };
  searchParams: { returnUrl?: string };
};

export default async function Page({
  params: { id },
  searchParams: { returnUrl },
}: PageProps) {
  const deck = await getDeckDetails(+id);

  if (!deck) {
    return redirect(returnUrl ?? "/application");
  }

  return (
    <div className="h-full p-2">
      <DeckDetails deck={deck} />
    </div>
  );
}
