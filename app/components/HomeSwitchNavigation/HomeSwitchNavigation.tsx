"use client";

import { usePathname } from "next/navigation";
import { SwitchNavigation } from "../SwitchNavigation/SwitchNavigation";

const navigationItems = [
  { label: "My Profile", href: "/profile" },
  { label: "History/Rewards", href: "/" },
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
