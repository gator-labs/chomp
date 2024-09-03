import { getCurrentUser } from "@/app/queries/user";
import { cn } from "@/app/utils/tailwind";
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
  className?: string;
};

export async function Profile({
  showLeaderboardButton = false,
  editAllowed = false,
  className,
}: ProfileProps) {
  const user = await getCurrentUser();
  const username = user?.username || "";
  const address = user?.wallets[0].address || "";
  const avatarSrc = user?.profileSrc || AvatarPlaceholder.src;

  return (
    <div
      className={cn(
        "flex items-center py-4 rounded-2xl bg-grey-950 gap-4",
        className,
      )}
    >
      <div>
        <Avatar
          size="extralarge"
          className="border-purple-500"
          src={avatarSrc}
        />
      </div>
      <div className="flex flex-col font-sora text-grey-0 gap-y-4 flex-1">
        <div className="flex items-baseline">
          {username.length > 0 && (
            <span className="font-bold text-sm text-grey-0 mr-1">
              {"@" + username}
            </span>
          )}
          <Link href="/application/settings">
            <span className="font-normal text-sm text-purple-500">
              {"Edit profile"}
            </span>
          </Link>
        </div>
        <div className="flex gap-2">
          <div>
            <Button
              className="text-sm font-normal inline-flex items-center gap-2 !border-0 bg-grey-800 !w-fit"
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
          </div>
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
