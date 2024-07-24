import History from "@/app/components/History/History";
import HistoryHeader from "@/app/components/HistoryHeader/HistoryHeader";
import { getTotalClaimableRewards } from "@/app/queries/history";

type PageProps = {
  searchParams: { sort: string; type: string; openIds: string };
};

export default async function Page({ searchParams }: PageProps) {
  const totalClaimableRewards = await getTotalClaimableRewards();
  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      <HistoryHeader totalClaimableRewards={totalClaimableRewards} />
      <History
        totalClaimableRewards={totalClaimableRewards}
        sort={searchParams.sort ?? "Date"}
        type={searchParams.type ?? "Deck"}
      />
    </div>
  );
}
