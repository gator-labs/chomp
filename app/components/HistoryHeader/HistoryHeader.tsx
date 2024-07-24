import TotalRewardsClaimAll from "../History/TotalRewardsClaimAll/TotalRewardsClaimAll";

interface Props {
  totalClaimableRewards: number;
}

const HistoryHeader = ({ totalClaimableRewards }: Props) => {
  return (
    <div className="py-4 flex flex-col gap-4">
      <TotalRewardsClaimAll totalRevealedRewards={totalClaimableRewards} />
    </div>
  );
};

export default HistoryHeader;
