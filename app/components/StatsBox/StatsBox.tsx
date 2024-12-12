"use client";

import { HOME_STAT_CARD_TYPE } from "@/app/constants/tracking";
import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";

import StatsDrawer from "../StatsDrawer/StatsDrawer";

type StatsBoxProps = {
  title: string;
  icon: ReactNode;
  description: string;
  className?: string;
  drawerProps: {
    title: string;
    description: string;
    type: keyof typeof HOME_STAT_CARD_TYPE;
  };
  titleColor: string;
};

export function StatsBox({
  title,
  icon,
  description,
  className,
  drawerProps,
  titleColor,
}: StatsBoxProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getTitleColor = (title: string) => {
    switch (title.toLowerCase()) {
      case "claimed":
        return "text-chomp-orange-light";
      case "points":
        return "text-chomp-green-light";
      case "credits":
        return "text-chomp-blue-light";
      default:
        return "text-white";
    }
  };

  return (
    <>
      <StatsDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        {...drawerProps}
      />
      <div
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full rounded-[8px] border-[0.5px] border-solid p-4 border-gray-600 bg-gray-800 flex flex-col gap-2 transition-all duration-200 hover:bg-gray-700 cursor-pointer",
          {
            "bg-gray-600": isOpen,
          },
          className,
        )}
      >
        <div className="flex justify-between items-center basis-full">
          <p className={cn("font-bold", getTitleColor(titleColor))}>{title}</p>
          <div>{icon}</div>
        </div>
        <p className="text-sm text-gray-400 font-medium">{description}</p>
      </div>
    </>
  );
}
