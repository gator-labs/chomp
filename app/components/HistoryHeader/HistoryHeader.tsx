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
  profileImg: string;
  deckId?: number;
  isMysteryBoxEnabled?: boolean;
}

const HistoryHeader = ({
  totalClaimableRewards,
  revealableQuestions,
  profileImg,
  deckId,
  isMysteryBoxEnabled,
}: Props) => {
  return (
    <div className="py-4 flex flex-col gap-4">
      <PotentialRewardsRevealAll
        revealableQuestions={revealableQuestions}
        deckId={deckId}
        isMysteryBoxEnabled={isMysteryBoxEnabled ?? false}
      />
      <TotalRewardsClaimAll
        profileImg={profileImg}
        totalClaimableRewards={totalClaimableRewards}
        deckId={deckId}
      />
    </div>
  );
};

export default HistoryHeader;
