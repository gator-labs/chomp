import { ProgressBar } from "../ProgressBar/ProgressBar";
import { Tag } from "../Tag/Tag";

type GeneralRankCardProps = {
  rank: number;
  percentage: number;
};

export default function GeneralRankCard({
  rank,
  percentage,
}: GeneralRankCardProps) {
  return (
    <div className="flex justify-between items-center rounded-full px-6 py-4 bg-[#333]">
      <span className="text-s leading-4">You rank top {rank}!</span>

      <div className="flex items-center text-white text-xs font-semibold">
        <div className="w-[130px] mr-1">
          <ProgressBar
            bgColor="#fff"
            progressColor="#CFC5F7"
            percentage={percentage}
          />
        </div>
        <span>{percentage}%</span>
      </div>
    </div>
  );
}
