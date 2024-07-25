import PotentialRewardsRevealAll from "../History/PotentialRewardsRevealAll/PotentialRewardsRevealAll";
import TotalRewardsClaimAll from "../History/TotalRewardsClaimAll/TotalRewardsClaimAll";

interface Props {
  totalClaimableRewards: number;
  revealableQuestions: {
    id: number;
    revealTokenAmount: number;
  }[];
}

const HistoryHeader = ({
  totalClaimableRewards,
  revealableQuestions,
}: Props) => {
  return (
    <div className="py-4 flex flex-col gap-4">
      <TotalRewardsClaimAll totalRevealedRewards={totalClaimableRewards} />
      <PotentialRewardsRevealAll revealableQuestions={revealableQuestions} />
    </div>
  );
};

export default HistoryHeader;
