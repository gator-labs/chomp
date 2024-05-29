import { getMyFungibleAssetBalances } from "@/app/actions/fungible-asset";
import GeneralRankCard from "@/app/components/GeneralRankCard/GeneralRankCard";
import { HomeSwitchNavigation } from "@/app/components/HomeSwitchNavigation/HomeSwitchNavigation";
import { LogoutButton } from "@/app/components/LogoutButton/LogoutButton";
import PointBalanceCard from "@/app/components/PointBalanceCard/PointBalanceCard";
import { Profile } from "@/app/components/Profile/Profile";
import { ResetAccountDataButton } from "@/app/components/ResetAccountDataButton/ResetAccountDataButton";
import TagRankCard from "@/app/components/TagRankCard/TagRankCard";
import { getProfileImage } from "@/app/queries/profile";

export default async function Page() {
  const isDemo = process.env.ENVIRONMENT === "demo";
  const balances = await getMyFungibleAssetBalances();
  const profile = await getProfileImage();

  return (
    <div className="flex flex-col px-4 gap-4">
      <HomeSwitchNavigation />
      <Profile
        avatarSrc={profile}
        fullName="User Name"
        handle="@user"
        joinDate={new Date()}
      />

      <PointBalanceCard amount={balances.Point} />

      <p>General Accuracy</p>
      <GeneralRankCard rank={150} percentage={72} />

      <p>Your top 3 categories</p>
      <TagRankCard tag="DeFi" percentage={92} />
      <TagRankCard tag="GameFi" percentage={78} />
      <TagRankCard tag="DePin" percentage={52} />

      {isDemo && <ResetAccountDataButton />}
      <LogoutButton />
    </div>
  );
}
