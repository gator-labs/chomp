import { LogoutButton } from "./components/LogoutButton/LogoutButton";
import { PageLayout } from "./components/PageLayout/PageLayout";
import { HomeSwitchNavigation } from "./components/HomeSwitchNavigation/HomeSwitchNavigation";
import { Suspense } from "react";
import { UserTokenBalance } from "./components/UserTokenBalance/UserTokenBalance";

export default async function Page() {
  return (
    <PageLayout>
      <HomeSwitchNavigation />
      <div>home page</div>
      <Suspense fallback={<div>loading bonk balance...</div>}>
        <UserTokenBalance />
      </Suspense>
      <LogoutButton />
    </PageLayout>
  );
}
