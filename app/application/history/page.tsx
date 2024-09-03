import { getTotalClaimableRewards } from "@/app/actions/history";
import History from "@/app/components/History/History";
import HistoryHeader from "@/app/components/HistoryHeader/HistoryHeader";
import ProfileNavigation from "@/app/components/ProfileNavigation/ProfileNavigation";
import { getAllQuestionsReadyForReveal } from "@/app/queries/history";

export default async function Page() {
  const [revealableQuestions, totalClaimableRewards] = await Promise.all([
    getAllQuestionsReadyForReveal(),
    getTotalClaimableRewards(),
  ]);

  return (
    <>
      <div className="flex flex-col gap-4 overflow-hidden px-4">
        <ProfileNavigation />
        <HistoryHeader
          totalClaimableRewards={totalClaimableRewards}
          revealableQuestions={revealableQuestions}
        />
        <History />
      </div>
    </>
  );
}
