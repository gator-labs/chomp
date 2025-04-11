import TrophyStarMarkIcon from "@/app/components/Icons/TrophyStarMarkIcon";
import { ArrowRight } from "lucide-react";

export type NoAnswerRewardsProps = {};

export function NoAnswerRewards({}: NoAnswerRewardsProps) {
  return (
    <div className="rounded-2xl text-sm flex p-2 justify-between items-center w-full bg-gray-700">
      <div className="flex gap-1">
        <div className="bg-gray-800 text-gray-600 rounded-xl px-4 text-xs font-bold align-middle items-center flex">
          <TrophyStarMarkIcon height={16} width={16} fill="#4D4D4D" />
          <span className="ml-1 text-xs text-gray-600 font-bold">
            Pending...
          </span>
        </div>
        <div className="text-xs font-bold items-center flex max-w-[20em] p-2">
          Check Mystery Box for available rewards
        </div>
      </div>
      <a className="bg-purple-400 p-3 rounded-xl" href="/application/rewards">
        <ArrowRight color="#FFFFFF" />
      </a>
    </div>
  );
}
