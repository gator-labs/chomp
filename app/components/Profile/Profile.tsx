import { getCurrentUser } from "@/app/queries/user";
import { cn } from "@/app/utils/tailwind";
import { BuyBulkCreditsButton } from "@/components/BuyBulkCreditsButton";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import Link from "next/link";

import { ProfileWalletAddressButton } from "../../../components/ProfileWalletAddressButton/ProfileWalletAddressButton";
import { Avatar } from "../Avatar/Avatar";
import { Button } from "../Button/Button";

type ProfileProps = {
  showLeaderboardButton?: boolean;
  avatarHref?: string;
  className?: string;
};

export async function Profile({
  showLeaderboardButton = false,
  className,
}: ProfileProps) {
  const user = await getCurrentUser();
  const username = user?.username || "";
  const address = user?.wallets?.[0]?.address || "";
  const avatarSrc = user?.profileSrc || AvatarPlaceholder.src;

  return (
    <div
      className={cn(
        "flex items-center py-4 rounded-2xl bg-gray-900 gap-4",
        className,
      )}
    >
      <div>
        <Avatar size="extralarge" className="border-white" src={avatarSrc} />
      </div>
      <div className="flex flex-col  text-white gap-y-4 flex-1">
        <div className="flex items-baseline">
          {username.length > 0 && (
            <span className="font-bold text-sm text-white mr-1">
              {"@" + username}
            </span>
          )}
          <Link href="/application/settings">
            <span className="font-normal text-sm text-secondary">
              Edit profile
            </span>
          </Link>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2 justify-center">
            <ProfileWalletAddressButton address={address} />
            <BuyBulkCreditsButton size="small" />
          </div>

          {showLeaderboardButton && (
            <Link href="/application/leaderboard" className="contents">
              <Button
                className="text-sm font-normal inline-flex items-center gap-2 !border-0 bg-purple-400 !w-fit"
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
