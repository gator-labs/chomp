import { getProfile } from "@/app/queries/profile";
import { Question } from "@prisma/client";
import PotentialRewardsRevealAll from "../History/PotentialRewardsRevealAll/PotentialRewardsRevealAll";
import TotalRewardsClaimAll from "../History/TotalRewardsClaimAll/TotalRewardsClaimAll";

interface Props {
  totalClaimableRewards?: {
    questions: (Question | null)[];
    totalClaimableRewards: number;
  };
  revealableQuestions: {
    id: number;
    revealTokenAmount: number;
    question: string;
  }[];
}

const HistoryHeader = async ({
  totalClaimableRewards,
  revealableQuestions,
}: Props) => {
  const profile = await getProfile();
  return (
    <div className="py-4 flex flex-col gap-4">
      <PotentialRewardsRevealAll
        revealableQuestions={revealableQuestions}
        profileSrc={profile!.profileSrc as string}
      />
      <TotalRewardsClaimAll totalClaimableRewards={totalClaimableRewards} />
    </div>
  );
};

export default HistoryHeader;
