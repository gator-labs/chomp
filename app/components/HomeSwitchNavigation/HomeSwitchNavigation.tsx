"use client";

import { usePathname } from "next/navigation";
import { SwitchNavigation } from "../SwitchNavigation/SwitchNavigation";

const navigationItems = [
  { label: "My Profile", href: "/application/profile" },
  { label: "History/Rewards", href: "/application/history" },
];

export function HomeSwitchNavigation() {
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
