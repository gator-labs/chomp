import { HomeSwitchNavigation } from "@/app/components/HomeSwitchNavigation/HomeSwitchNavigation";
import { Profile } from "@/app/components/Profile/Profile";
import AvatarPlaceholder from "../../../public/images/avatar_placeholder.png";
import TagRankCard from "@/app/components/TagRankCard/TagRankCard";
import GeneralRankCard from "@/app/components/GeneralRankCard/GeneralRankCard";
import PointBalanceCard from "@/app/components/PointBalanceCard/PointBalanceCard";
import { LogoutButton } from "@/app/components/LogoutButton/LogoutButton";
import { getMyFungibleAssetBalances } from "@/app/actions/fungible-asset";

export default async function Page() {
  const balances = await getMyFungibleAssetBalances();

  return (
    <div className="flex flex-col px-4 gap-4">
      <HomeSwitchNavigation />
      <Profile
        avatarSrc={AvatarPlaceholder.src}
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

      <LogoutButton />
    </div>
  );
}
