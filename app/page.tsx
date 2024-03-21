import { LogoutButton } from "./components/LogoutButton/LogoutButton";
import { PageLayout } from "./components/PageLayout/PageLayout";
import { getUserTokenBalances } from "../lib/web3";
import { HomeSwitchNavigation } from "./components/HomeSwitchNavigation/HomeSwitchNavigation";

export default async function Page() {
  const { bonk } = await getUserTokenBalances();

  return (
    <PageLayout>
      <HomeSwitchNavigation />
      <div>home page</div>
      <div>bonk balance: {bonk}</div>
      <LogoutButton />
    </PageLayout>
  );
}
