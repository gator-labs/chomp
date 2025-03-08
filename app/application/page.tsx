import { BannerContainer } from "@/components/BannerContainer";
import { Suspense } from "react";

import { DashboardUserStats } from "../components/DashboardUserStats/DashboardUserStats";
import HomeFeedVerticalDeckSection from "../components/HomeFeedVerticalDeckSection/HomeFeedVerticalDeckSection";
import { Profile } from "../components/Profile/Profile";
import ProfileNavigation from "../components/ProfileNavigation/ProfileNavigation";
import Spinner from "../components/Spinner/Spinner";

export default async function Page() {
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

      <BannerContainer />

      <Suspense fallback={<Spinner />}>
        <HomeFeedVerticalDeckSection />
      </Suspense>
    </>
  );
}
