"use client";

import { cn } from "@/app/utils/tailwind";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROFILE_LINKS } from "./constants";

const ProfileNavigation = () => {
  const pathname = usePathname();

  console.log('pathname', pathname)
  return (
    <ul className="p-1 gap-2 bg-[#333333] rounded-[48px] grid grid-cols-3 my-4">
      {PROFILE_LINKS.map(({ href, label }) => (
        console.log('href', href),
        console.log('label', label),
        <li
          className={cn("rounded-[32px] text-[#999999]", {
            "bg-white text-[#0D0D0D] font-semibold": pathname === href,
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
