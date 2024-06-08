import { getMyFungibleAssetBalances } from "@chomp/app/actions/fungible-asset";
import { getJwtPayload } from "@chomp/app/actions/jwt";
import History from "@chomp/app/components/History/History";
import PointBalanceCard from "@chomp/app/components/PointBalanceCard/PointBalanceCard";
import { Profile } from "@chomp/app/components/Profile/Profile";
import { getProfile, getProfileImage } from "@chomp/app/queries/profile";
import { getAddressFromVerifiedCredentials } from "@chomp/app/utils/wallet";

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
