import { getMyFungibleAssetBalances } from "@/app/actions/fungible-asset";
import { getJwtPayload } from "@/app/actions/jwt";
import History from "@/app/components/History/History";
import PointBalanceCard from "@/app/components/PointBalanceCard/PointBalanceCard";
import { Profile } from "@/app/components/Profile/Profile";
import { getProfile, getProfileImage } from "@/app/queries/profile";
import { getAddressFromVerifiedCredentials } from "@/app/utils/wallet";
import Link from "next/link";

type PageProps = {
  searchParams: { sort: string; openIds: string };
};

export default async function Page({ searchParams }: PageProps) {
  const payload = await getJwtPayload();
  const balances = await getMyFungibleAssetBalances();
  const profileSrc = await getProfileImage();
  const profile = await getProfile();
  const address = getAddressFromVerifiedCredentials(payload);

  return (
    <div className="flex flex-col px-4 gap-4">
      <div className="flex justify-between">
        <Link href="/application/profile">Dashboard</Link>
        <Link href="/application/profile/leaderboard">Leaderboard</Link>
      </div>
      <Profile
        address={address}
        avatarSrc={profileSrc}
        joinDate={profile?.createdAt ?? new Date()}
      />

      <PointBalanceCard amount={balances.Point} />
      <History sort={searchParams.sort ?? "Date"} />
    </div>
  );
}
