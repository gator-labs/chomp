import { getTotalClaimableRewards } from "@/app/actions/history";
import HistoryHeader from "@/app/components/HistoryHeader/HistoryHeader";
import HistoryList from "@/app/components/HistoryList/HistoryList";
import HistoryListSkeleton from "@/app/components/HistoryListSkeleton/HistoryListSkeleton";
import { getAllQuestionsReadyForReveal } from "@/app/queries/history";
import { Suspense } from "react";

export default async function Page() {
  const [revealableQuestions, totalClaimableRewards] = await Promise.all([
    getAllQuestionsReadyForReveal(),
    getTotalClaimableRewards(),
  ]);

  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      <HistoryHeader
        totalClaimableRewards={totalClaimableRewards}
        revealableQuestions={revealableQuestions}
      />
      <Suspense fallback={<HistoryListSkeleton />}>
        <HistoryList />
      </Suspense>
    </div>
  );
}
