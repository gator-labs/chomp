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
};

export function StatsBox({
  title,
  icon,
  description,
  className,
  drawerProps,
}: StatsBoxProps) {
  const [isOpen, setIsOpen] = useState(false);

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
          "w-full rounded-[8px] border-[0.5px] border-solid p-4 border-gray-500 bg-gray-700 flex flex-col gap-4 transition-all duration-200 hover:bg-gray-600 cursor-pointer",
          {
            "bg-gray-600": isOpen,
          },
          className,
        )}
      >
        <div className="flex justify-between items-center basis-full">
          <p className="text-sm font-bold">{title}</p>
          <div>{icon}</div>
        </div>
        <p className="text-sm font-medium">{description}</p>
      </div>
    </>
  );
}
