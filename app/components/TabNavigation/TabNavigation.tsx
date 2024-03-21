"use client";

import { ChallengeIcon } from "../Icons/ChallengeIcon";
import { HomeIcon } from "../Icons/HomeIcon";
import { ComposeIcon } from "../Icons/ComposeIcon";
import { usePathname } from "next/navigation";
import { Navigation } from "../Navigation/Navigation";

const navigationItems = [
  { label: "Answer", icon: <ChallengeIcon />, href: "/answer" },
  { label: "Home", icon: <HomeIcon />, href: "/", subHref: ["/profile"] },
  { label: "Ask", icon: <ComposeIcon />, href: "/ask" },
];

export function TabNavigation() {
  const pathname = usePathname();

  return (
    <Navigation
      items={navigationItems.map((ni) => ({
        ...ni,
        isActive: ni.href === pathname || (ni.subHref || []).includes(pathname),
      }))}
    />
  );
}
