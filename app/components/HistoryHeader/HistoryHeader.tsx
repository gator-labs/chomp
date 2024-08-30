import PotentialRewardsRevealAll from "../History/PotentialRewardsRevealAll/PotentialRewardsRevealAll";
import TotalRewardsClaimAll from "../History/TotalRewardsClaimAll/TotalRewardsClaimAll";

interface Props {
  totalClaimableRewards: number;
  revealableQuestions: {
    id: number;
    revealTokenAmount: number;
    question: string;
  }[];
}

const HistoryHeader = ({
  totalClaimableRewards,
  revealableQuestions,
}: Props) => {
  return (
    <div className="py-4 flex flex-col gap-4">
      <PotentialRewardsRevealAll revealableQuestions={revealableQuestions} />
      <TotalRewardsClaimAll totalRevealedRewards={totalClaimableRewards} />
    </div>
  );
};

export default HistoryHeader;
