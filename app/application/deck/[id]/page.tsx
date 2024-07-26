import { notFound } from "next/navigation";

type PageProps = {
  params: { id: string };
  searchParams: { returnUrl?: string };
};

export default async function Page({
  params: { id },
  searchParams: { returnUrl },
}: PageProps) {
  return notFound();

  // const deck = await getDeckDetails(+id);

  // if (!deck) {
  //   return redirect(returnUrl ?? "/application");
  // }

  // return <DeckDetails deck={deck} />;
}
