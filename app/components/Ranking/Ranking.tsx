import classNames from "classnames";
import { Avatar } from "../Avatar/Avatar";
import { LevelProgress } from "../LevelProgress/LevelProgress";

type RankingProps = {
  rank: string;
  userName: string;
  avatarSrc: string;
  level: string;
  progress: number;
  isHighlighted?: boolean;
};

export function Ranking({
  rank,
  userName,
  avatarSrc,
  level,
  progress,
  isHighlighted = false,
}: RankingProps) {
  return (
    <div
      className={classNames("flex items-center rounded-full p-4", {
        "bg-[#333]": !isHighlighted,
        "bg-[#5C457B]": isHighlighted,
      })}
    >
      <div className="text-center bg-black rounded-full mr-1 w-6 h-6 text-white font-sora text-base">
        {rank}
      </div>
      <Avatar size="small" className="mr-4" src={avatarSrc} />
      <div className="text-white font-sora mr-7">{userName}</div>
      <div className="flex items-center text-white text-xs font-semibold">
        <div className="w-[130px] mr-1">
          <LevelProgress level={level} progress={progress} />
        </div>
        <span>{progress}%</span>
      </div>
    </div>
  );
}
