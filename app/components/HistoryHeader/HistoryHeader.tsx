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
  deckId?: number;
}

const HistoryHeader = ({
  totalClaimableRewards,
  revealableQuestions,
  deckId
}: Props) => {
  return (
    <div className="py-4 flex flex-col gap-4">
      <PotentialRewardsRevealAll revealableQuestions={revealableQuestions} deckId={deckId}  />
      <TotalRewardsClaimAll totalClaimableRewards={totalClaimableRewards} deckId={deckId}  />
    </div>
  );
};

export default HistoryHeader;
