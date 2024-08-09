import { getCurrentUser } from "@/app/queries/user";
import { formatAddress } from "@/app/utils/wallet";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import Link from "next/link";
import { Avatar } from "../Avatar/Avatar";
import { Button } from "../Button/Button";
import { PenIcon } from "../Icons/PenIcon";

type ProfileProps = {
  showLeaderboardButton?: boolean;
  editAllowed?: boolean;
  avatarHref?: string;
};

export async function Profile({
  showLeaderboardButton = false,
  editAllowed = false,
  avatarHref = "/application/profile",
}: ProfileProps) {
  const user = await getCurrentUser();
  const username = user?.username || "";
  const address = user?.wallets[0].address || "";
  const avatarSrc = user?.profileSrc || AvatarPlaceholder.src;

  return (
    <div className="flex items-center py-4 rounded-2xl bg-[#0D0D0D] gap-4">
      <Link href={avatarHref}>
        <Avatar
          size="extralarge"
          className="border-chomp-purple"
          src={avatarSrc}
        />
      </Link>
      <div className="flex flex-col font-sora text-white gap-y-4 flex-1">
        <div className="flex items-baseline">
          <span className="font-light text-sm">{`Welcome back`}</span>
          {username.length > 0 && (
            <>
              <span className="font-bold text-sm text-[#A3A3EC] ml-1">
                {"@" + username}
              </span>
              <span className="font-light text-sm">{"!"}</span>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={editAllowed ? "/application/profile/settings" : "#"}>
            <Button
              className="text-sm font-normal inline-flex items-center gap-2 !border-0 bg-[#333] !w-fit"
              isPill
              size="small"
            >
              <span className="font-normal font-sora">
                {formatAddress(address)}
              </span>
              {editAllowed && (
                <div className="p-[3.5px]">
                  <PenIcon width={12} height={12} fill="#999999" />
                </div>
              )}
            </Button>
          </Link>

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
