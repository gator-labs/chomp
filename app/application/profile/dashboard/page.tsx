import { getJwtPayload } from "@/app/actions/jwt";
import { Profile } from "@/app/components/Profile/Profile";
import { UserStatsCards } from "@/app/components/UserStatsCards/UserStatsCards";
import { getUserStatistics } from "@/app/queries/home";
import { getProfileImage, getUsername } from "@/app/queries/profile";
import { getAddressFromVerifiedCredentials } from "@/app/utils/wallet";

export default async function Page() {
  const payload = await getJwtPayload();
  const profileSrc = await getProfileImage();
  const stats = await getUserStatistics();
  const address = getAddressFromVerifiedCredentials(payload);
  const username = await getUsername();

  return (
    <div className="flex flex-col gap-4">
      <Profile
        address={address}
        avatarSrc={profileSrc}
        editAllowed
        username={username || ""}
      />
      <UserStatsCards
        averageTimeToAnswer={stats.averageTimeToAnswer}
        cardsChomped={stats.cardsChomped}
        daysStreak={stats.daysStreak}
        totalPointsEarned={stats.totalPointsEarned}
      />
    </div>
  );
}
