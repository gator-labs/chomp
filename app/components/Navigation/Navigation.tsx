"use client";

import classNames from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type NavigationProps = {
  items: {
    label: string;
    icon: ReactNode;
    href: string;
    isActiveRegex?: string;
  }[];
};

export function Navigation({ items }: NavigationProps) {
  const pathname = usePathname();

  return (
    <div className="flex justify-center p-1 space-x-6 py-3 w-full bg-gray-800 overflow-x-scroll">
      {items.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className="flex flex-col items-center w-[84px] gap-1"
        >
          <span
            className={classNames("px-4 py-1 rounded-full", {
              "bg-gray-700": item.isActiveRegex
                ? new RegExp(item.isActiveRegex).test(pathname)
                : item.href === pathname,
              "svg-active-fill": item.isActiveRegex
                ? new RegExp(item.isActiveRegex).test(pathname)
                : item.href === pathname,
            })}
          >
            {item.icon}
          </span>
          <span className="text-sm text-gray-200">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
