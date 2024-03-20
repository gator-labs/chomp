"use client";

import { ChallengeIcon } from "../Icons/ChallengeIcon";
import { HomeIcon } from "../Icons/HomeIcon";
import { ComposeIcon } from "../Icons/ComposeIcon";
import { usePathname } from "next/navigation";
import { Navigation } from "../Navigation/Navigation";

const navigationItems = [
  {
    label: "Answer",
    icon: <ChallengeIcon />,
    href: "/answer",
    isActive: false,
  },
  { label: "Home", icon: <HomeIcon />, href: "/", isActive: false },
  { label: "Ask", icon: <ComposeIcon />, href: "/ask", isActive: false },
];

export function TabNavigation() {
  const pathname = usePathname();
  navigationItems.forEach((ni) => {
    ni.isActive = ni.href === pathname;
  });

  return <Navigation items={navigationItems} />;
}
