import { formatAddress } from "@/app/utils/wallet";
import Link from "next/link";
import { Avatar } from "../Avatar/Avatar";
import { Button } from "../Button/Button";

type ProfileProps = {
  address: string;
  avatarSrc: string;
  showLeaderboardButton?: boolean;
};

export function Profile({
  address,
  avatarSrc,
  showLeaderboardButton = false,
}: ProfileProps) {
  return (
    <div className="flex items-center py-4 rounded-2xl bg-[#0D0D0D] gap-4">
      <Avatar
        size="extralarge"
        className="border-chomp-purple"
        src={avatarSrc}
      />
      <div className="flex flex-col font-sora text-white gap-y-4 flex-1">
        <span className="font-light text-sm">{"Welcome back,"}</span>
        <div className="flex gap-2">
          <Button
            className="text-sm font-normal inline-flex items-center gap-2 !border-0 bg-[#333] !w-fit"
            isPill
            size="small"
          >
            <span className="font-normal font-sora">
              {formatAddress(address)}
            </span>
          </Button>
          {showLeaderboardButton && (
            <Link href="/application/profile/leaderboard" className="contents">
              <Button
                className="text-sm font-normal inline-flex items-center gap-2 !border-0 bg-[#575CDF] !w-fit"
                isPill
                size="small"
              >
                <span className="font-normal text-xs">View Leaderboard</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
