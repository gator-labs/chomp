"use client";

import { usePathname } from "next/navigation";
import { SwitchNavigation } from "../SwitchNavigation/SwitchNavigation";

const navigationItems = [
  { label: "Dashboard", href: "/application/profile" },
  { label: "Leaderboard", href: "/application/leaderboard" },
  { label: "History", href: "/application/history" },
];

export function ProfileSwitchNavigation() {
  const pathname = usePathname();

  return (
    <SwitchNavigation
      navigationItems={navigationItems.map((ni) => ({
        ...ni,
        isActive: ni.href === pathname,
      }))}
    />
  );
}
