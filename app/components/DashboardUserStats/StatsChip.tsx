import classNames from "classnames";
import { ReactNode } from "react";

type StatsChipProps = {
  title: string;
  icon: ReactNode;
  info: string;
  className?: string;
};

export function StatsChip({ title, icon, info, className }: StatsChipProps) {
  return (
    <div
      className={classNames(
        className,
        "flex font-sora flex-wrap gap-y-4 text-white rounded-lg p-4 bg-[#333] border-[1px] border-[#666] h-full",
      )}
    >
      <div className="flex justify-between items-center basis-full">
        <div className="text-sm">{title}</div>
        <div>{icon}</div>
      </div>
      <div className="basis-full text-xl font-semibold">{info}</div>
    </div>
  );
}
