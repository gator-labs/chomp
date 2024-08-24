import { Profile } from "@/app/components/Profile/Profile";
import ProfileNavigation from "@/app/components/ProfileNavigation/ProfileNavigation";
import Spinner from "@/app/components/Spinner/Spinner";
import { UserStatsCards } from "@/app/components/UserStatsCards/UserStatsCards";
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <ProfileNavigation />
      <div className="flex flex-col gap-4">
        <Suspense fallback={<Spinner />}>
          <Profile editAllowed avatarHref="/application" />
        </Suspense>

        <Suspense fallback={<Spinner />}>
          <UserStatsCards />
        </Suspense>
      </div>
    </>
  );
}
