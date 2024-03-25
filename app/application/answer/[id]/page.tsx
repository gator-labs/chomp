import { getDeckDetailsById } from "@/app/queries/deck";

type PageProps = {
  params: { id: string };
};

export default async function Page({ params: { id } }: PageProps) {
  const deck = await getDeckDetailsById(+id);
  return (
    <div>
      <div>{deck?.deck}</div>
      <div>{deck?.questionDecks?.map((qd) => qd.question.question)}</div>
    </div>
  );
}
