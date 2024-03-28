import { HomeSwitchNavigation } from "@/app/components/HomeSwitchNavigation/HomeSwitchNavigation";
import { LogoutButton } from "../components/LogoutButton/LogoutButton";
import { AuthRedirect } from "../components/AuthRedirect/AuthRedirect";

export default function Page() {
  return (
    <>
      <HomeSwitchNavigation />
      home page
      <br />
      <LogoutButton />
      <AuthRedirect />
    </>
  );
}
