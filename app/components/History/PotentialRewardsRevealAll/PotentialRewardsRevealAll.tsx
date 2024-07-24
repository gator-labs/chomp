import { numberToCurrencyFormatter } from "@/app/utils/currency";

type PotentialRewardsRevealAllProps = {
  potentialRevealRewards: number;
};

export default function PotentialRewardsRevealAll({
  potentialRevealRewards = 0,
}: PotentialRewardsRevealAllProps) {
  return (
    <div className="flex justify-between px-4 mt-4">
      <div className="flex flex-col justify-between">
        <div className="text-xs text-white font-sora">Potential Rewards</div>
        <div className="text-base text-white font-sora font-semibold">
          {numberToCurrencyFormatter.format(potentialRevealRewards)} BONK
        </div>
      </div>
    </div>
  );
}
