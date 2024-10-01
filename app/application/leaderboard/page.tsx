import BannerSlider from "@/app/components/BannerSlider/BannerSlider";
import ChompLeaderboard from "@/app/components/ChompLeaderboard/ChompLeaderboard";
import ProfileNavigation from "@/app/components/ProfileNavigation/ProfileNavigation";
import StackLeaderboard from "@/app/components/StackLeaderboard/StackLeaderboard";
import { getActiveBanners } from "@/app/queries/banner";

const LeaderboardPage = async () => {
  const banners = await getActiveBanners();

  return (
    <>
      <div>
        <ProfileNavigation />
        <BannerSlider banners={banners} />
        <div className="flex flex-col gap-4 pb-4">
          <ChompLeaderboard />
          <StackLeaderboard />
        </div>
      </div>
    </>
  );
};

export default LeaderboardPage;
