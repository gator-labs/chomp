import { Question } from "@prisma/client";

import PotentialRewardsRevealAll from "../History/PotentialRewardsRevealAll/PotentialRewardsRevealAll";
import TotalRewardsClaimAll from "../History/TotalRewardsClaimAll/TotalRewardsClaimAll";

interface Props {
  totalClaimableRewards?: {
    questions: (Question | null)[];
    totalClaimableRewards: number;
  };
  revealableQuestions: {
    id: any;
    revealTokenAmount: number;
    question: string;
  }[];
  profileImg: string;
}

const HistoryHeader = ({
  totalClaimableRewards,
  revealableQuestions,
  profileImg,
}: Props) => {
  return (
    <div className="py-4 flex flex-col gap-4">
      <PotentialRewardsRevealAll revealableQuestions={revealableQuestions} />
      <TotalRewardsClaimAll
        totalClaimableRewards={totalClaimableRewards}
        profileImg={profileImg}
      />
    </div>
  );
};

export default HistoryHeader;
