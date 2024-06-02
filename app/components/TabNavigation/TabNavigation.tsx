"use client";

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

interface Props {
  isAdmin: boolean;
}

export function TabNavigation({ isAdmin }: Props) {
  return (
    <Navigation
      items={[...navigationItems, ...(isAdmin ? adminNavigationItems : [])]}
    />
  );
}
