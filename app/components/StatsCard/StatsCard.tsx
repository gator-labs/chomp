import { ReactNode } from "react";
import { InfoIcon } from "../Icons/InfoIcon";

type StatsCardProps = {
  title: string;
  icon: ReactNode;
  value: string;
};

export function StatsCard({ title, icon, value }: StatsCardProps) {
  return (
    <div className="flex flex-row justify-between items-end text-white rounded-lg p-4 bg-gray-800 border-[1px] border-gray-600 h-[70px]">
      <div className="flex gap-x-4 ">
        <div>{icon}</div>
        <div className="flex flex-col gap-1">
          <div className="text-xs  font-light">{title}</div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </div>
      <div>
        <InfoIcon height={24} width={24} />
      </div>
    </div>
  );
}
