"use client";

import { cn } from "@/app/utils/tailwind";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { PROFILE_LINKS } from "./constants";

const ProfileNavigation = () => {
  const pathname = usePathname();

  return (
    <ul className="p-1 gap-2 bg-gray-700 rounded-[48px] grid grid-cols-3 my-4">
      {PROFILE_LINKS.map(({ href, label }) => (
        <li
          className={cn("rounded-[32px] text-gray-400", {
            "bg-white text-gray-900 font-semibold": pathname === href,
          })}
          key={href}
        >
          <Link
            className="text-xs h-[32px] flex items-center justify-center"
            href={href}
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default ProfileNavigation;
