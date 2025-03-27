"use client";

import { STACKS_PATH } from "@/lib/urls";
import { NotebookPen } from "lucide-react";

import { ChallengeIcon } from "../Icons/ChallengeIcon";
import { HomeIcon } from "../Icons/HomeIcon";
import { SettingsIcon } from "../Icons/SettingsIcon";
import StacksIcon from "../Icons/StacksIcon";
import { Navigation } from "../Navigation/Navigation";

const navigationItems = [
  {
    label: "Answer",
    icon: <ChallengeIcon />,
    href: "/application/answer",
    isActiveRegex: "/application/answer.*",
  },
  { label: "Home", icon: <HomeIcon />, href: "/application" },
  { label: "Stacks", icon: <StacksIcon />, href: STACKS_PATH },
  {
    label: "Ask",
    icon: <NotebookPen />,
    href: "/application/ask",
    isActive: process.env.NEXT_PUBLIC_FF_ASK,
  },
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
      classes="p-1 space-x-6 py-3"
    />
  );
}
