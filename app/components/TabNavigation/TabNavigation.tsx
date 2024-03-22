import { ChallengeIcon } from "../Icons/ChallengeIcon";
import { HomeIcon } from "../Icons/HomeIcon";
import { ComposeIcon } from "../Icons/ComposeIcon";
import { Navigation } from "../Navigation/Navigation";
import { getIsUserAdmin } from "@/app/queries/user";
import { SettingsIcon } from "../Icons/SettingsIcon";

const navigationItems = [
  { label: "Answer", icon: <ChallengeIcon />, href: "/application/answer" },
  {
    label: "Home",
    icon: <HomeIcon />,
    href: "/application",
    altHref: ["/application/profile"],
  },
  { label: "Ask", icon: <ComposeIcon />, href: "/application/ask" },
];

const adminNavigationItems = [
  { label: "Admin", icon: <SettingsIcon />, href: "/admin" },
];

export async function TabNavigation() {
  const isAdmin = await getIsUserAdmin();

  return (
    <Navigation
      items={[...navigationItems, ...(isAdmin ? adminNavigationItems : [])]}
    />
  );
}
