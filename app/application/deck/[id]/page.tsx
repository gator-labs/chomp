import { getDeckDetails } from "@/app/queries/deck";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

const DeckDetails = dynamic(
  () => import("@/app/components/DeckDetails/DeckDetails"),
  { ssr: false },
);

type PageProps = {
  params: { id: string };
  searchParams: { returnUrl?: string; openIds: string };
};

export default async function Page({
  params: { id },
  searchParams: { returnUrl, openIds },
}: PageProps) {
  const deck = await getDeckDetails(+id);

  if (!deck) {
    return redirect(returnUrl ?? "/application");
  }

  return (
    <div className="h-full p-2">
      <DeckDetails
        deck={deck}
        openIds={openIds ? JSON.parse(decodeURIComponent(openIds)) : []}
      />
    </div>
  );
}
