"use client";

import Link from "next/link";
import classNames from "classnames";
import c from "./TabNavigation.module.css";
import { ChallengeIcon } from "../Icons/ChallengeIcon";
import { HomeIcon } from "../Icons/HomeIcon";
import { ComposeIcon } from "../Icons/ComposeIcon";
import { usePathname } from "next/navigation";

const navigationItems = [
  { label: "Answer", icon: <ChallengeIcon />, href: "/answer" },
  { label: "Home", icon: <HomeIcon />, href: "/" },
  { label: "Ask", icon: <ComposeIcon />, href: "/ask" },
];

export function TabNavigation() {
  const pathname = usePathname();

  return (
    <div className="flex justify-center p-1 space-x-6 py-3 w-full">
      {navigationItems.map((ni, index) => (
        <Link
          key={index}
          href={ni.href}
          className="flex flex-col items-center w-[84px] gap-1"
        >
          <span
            className={classNames("px-4 py-1 rounded-full", {
              "bg-btn-border-black": ni.href === pathname,
              [c["svg-active-fill"]]: ni.href === pathname,
            })}
          >
            {ni.icon}
          </span>
          <span className="text-[13px] text-[#ccc]">{ni.label}</span>
        </Link>
      ))}
    </div>
  );
}
