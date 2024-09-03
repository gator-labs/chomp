import BannerSlider from "@/app/components/BannerSlider/BannerSlider";
import CampaignLeaderboard from "@/app/components/CampaignLeaderboard/CampaignLeaderboard";
import ChompLeaderboard from "@/app/components/ChompLeaderboard/ChompLeaderboard";
import ProfileNavigation from "@/app/components/ProfileNavigation/ProfileNavigation";
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
          <CampaignLeaderboard />
        </div>
      </div>
    </>
  );
};

export default LeaderboardPage;
