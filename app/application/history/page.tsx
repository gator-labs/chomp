import { getTotalClaimableRewards } from "@/app/actions/history";
import History from "@/app/components/History/History";
import HistoryHeader from "@/app/components/HistoryHeader/HistoryHeader";
import ProfileNavigation from "@/app/components/ProfileNavigation/ProfileNavigation";
import { getAllQuestionsReadyForReveal } from "@/app/queries/history";
import { getUnopenedMysteryBox } from "@/app/queries/mysteryBox";
import { getProfileImage } from "@/app/queries/profile";
import { ReopenMysteryBox } from "@/components/MysteryBox/ReopenMysteryBox";
import { EBoxTriggerType } from "@prisma/client";

export default async function Page() {
  const [revealableQuestions, totalClaimableRewards, profileImg, mysteryBoxId] =
    await Promise.all([
      getAllQuestionsReadyForReveal(),
      getTotalClaimableRewards(),
      getProfileImage(),
      getUnopenedMysteryBox(EBoxTriggerType.ClaimAllCompleted),
    ]);

  return (
    <>
      <div className="flex flex-col gap-4 overflow-hidden">
        <ProfileNavigation />
        <HistoryHeader
          totalClaimableRewards={totalClaimableRewards}
          revealableQuestions={revealableQuestions}
          profileImg={profileImg}
        />
        <History />
      </div>
      {mysteryBoxId && <ReopenMysteryBox mysteryBoxId={mysteryBoxId} />}
    </>
  );
}
