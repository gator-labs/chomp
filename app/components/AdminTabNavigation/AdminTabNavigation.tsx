"use client";

import { usePathname } from "next/navigation";
import { Navigation } from "../Navigation/Navigation";
import { HomeIcon } from "../Icons/HomeIcon";
import { BackIcon } from "../Icons/BackIcon";
import { CommentIcon } from "../Icons/CommentIcon";

const navigationItems = [
  { label: "App", icon: <BackIcon />, href: "/" },
  { label: "Home", icon: <HomeIcon />, href: "/admin" },
  {
    label: "Questions",
    icon: <CommentIcon />,
    href: "/admin/questions",
    isActiveRegex: "/admin/questions.*",
  },
  {
    label: "Decks",
    icon: <CommentIcon />,
    href: "/admin/decks",
    isActiveRegex: "/admin/decks.*",
  },
];

export function AdminTabNavigation() {
  const pathname = usePathname();

  return <Navigation items={navigationItems} />;
}
