import { ReactNode } from "react";
import { InfoIcon } from "../Icons/InfoIcon";

type StatsCardProps = {
  title: string;
  icon: ReactNode;
  value: string;
  className?: string;
};

export function StatsCard({ title, icon, value, className }: StatsCardProps) {
  return (
    <div className="flex flex-row justify-between items-end text-white rounded-lg p-4 bg-[#333] border-[1px] border-[#666] h-full">
      <div className="flex gap-x-4 font-sora flex-wrap gap-y-4">
        <div>{icon}</div>
        <div className="flex flex-col gap-y-4">
          <div className="text-sm">{title}</div>
          <div className="basis-full text-xl font-semibold">{value}</div>
        </div>
      </div>
      <div>
        <InfoIcon height={24} width={24} />
      </div>
    </div>
  );
}
