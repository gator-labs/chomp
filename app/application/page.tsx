import { Suspense } from "react";
import BannerSlider from "../components/BannerSlider/BannerSlider";
import { DashboardUserStats } from "../components/DashboardUserStats/DashboardUserStats";
import { HomeFeedDeckExpiringSection } from "../components/HomeFeedDeckExpiringSection/HomeFeedDeckExpiringSection";
import { HomeFeedReadyToRevealSection } from "../components/HomeFeedReadyToRevealSection/HomeFeedReadyToRevealSection";
import { HomeFeedRevealedQuestionsSection } from "../components/HomeFeedRevealedQuestionsSection/HomeFeedRevealedQuestionsSection";
import { Profile } from "../components/Profile/Profile";
import ProfileNavigation from "../components/ProfileNavigation/ProfileNavigation";
import Spinner from "../components/Spinner/Spinner";
import { getActiveBanners } from "../queries/banner";
import { getQuestionsForRevealedSection } from "../queries/home";

export default async function Page() {
  const [questionsRevealed, banners] = await Promise.all([
    getQuestionsForRevealedSection(),
    getActiveBanners(),
  ]);

  return (
    <>
      <div className="flex flex-col gap-4 px-4">
        <ProfileNavigation />
        <Suspense fallback={<Spinner />}>
          <Profile />
        </Suspense>

        <Suspense fallback={<Spinner />}>
          <DashboardUserStats />
        </Suspense>
      </div>

      {!!banners.length && <BannerSlider banners={banners} />}

      <Suspense fallback={<Spinner />}>
        <HomeFeedDeckExpiringSection />
      </Suspense>

      <Suspense fallback={<Spinner />}>
        <HomeFeedReadyToRevealSection />
      </Suspense>
      <HomeFeedRevealedQuestionsSection questions={questionsRevealed} />
    </>
  );
}
