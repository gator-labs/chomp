import History from "@/app/components/History/History";

type PageProps = {
  searchParams: { sort: string; type: string; openIds: string };
};

export default async function Page({ searchParams }: PageProps) {
  return (
    <div className="flex flex-col gap-4">
      <History
        sort={searchParams.sort ?? "Date"}
        type={searchParams.type ?? "Deck"}
      />
    </div>
  );
}
