import { getTotalClaimableRewards } from "@/app/actions/history";
import HistoryHeader from "@/app/components/HistoryHeader/HistoryHeader";
import HistoryList from "@/app/components/HistoryList/HistoryList";
import HistoryListSkeleton from "@/app/components/HistoryListSkeleton/HistoryListSkeleton";
import { Suspense } from "react";

export default async function Page() {
  const totalClaimableRewards = await getTotalClaimableRewards();

  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      <HistoryHeader totalClaimableRewards={totalClaimableRewards} />

      <Suspense fallback={<HistoryListSkeleton />}>
        <HistoryList />
      </Suspense>
    </div>
  );
}
