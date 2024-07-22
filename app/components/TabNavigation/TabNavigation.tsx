import { getIsUserAdmin } from "@/app/queries/user";
import { ChallengeIcon } from "../Icons/ChallengeIcon";
import { ComposeIcon } from "../Icons/ComposeIcon";
import { HomeIcon } from "../Icons/HomeIcon";
import { SettingsIcon } from "../Icons/SettingsIcon";
import { Navigation } from "../Navigation/Navigation";

const navigationItems = [
  {
    label: "Answer",
    icon: <ChallengeIcon />,
    href: "/application/answer",
    isActiveRegex: "/application/answer.*",
  },
  { label: "Home", icon: <HomeIcon />, href: "/application" },
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
