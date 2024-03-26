import { HomeSwitchNavigation } from "@/app/components/HomeSwitchNavigation/HomeSwitchNavigation";
import { LogoutButton } from "../components/LogoutButton/LogoutButton";

export default function Page() {
  return (
    <>
      <HomeSwitchNavigation />
      home page
      <br />
      <LogoutButton />
    </>
  );
}
