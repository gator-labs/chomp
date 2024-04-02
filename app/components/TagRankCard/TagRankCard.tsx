import { ProgressBar } from "../ProgressBar/ProgressBar";
import { Tag } from "../Tag/Tag";

type TagRankCardProps = {
  tag: string;
  percentage: number;
};

export default function TagRankCard({ tag, percentage }: TagRankCardProps) {
  return (
    <div className="flex justify-between items-center rounded-full px-6 py-3 bg-[#333]">
      <Tag tag={tag} isSelected />

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
