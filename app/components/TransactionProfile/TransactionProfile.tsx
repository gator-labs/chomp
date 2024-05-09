"use client";

import { numberToCurrencyFormatter } from "@/app/utils/currency";
import { Avatar } from "../Avatar/Avatar";

type ProfileProps = {
  pointAmount: number;
  dollarAmount?: number;
  avatarSrc: string;
};

export function TransactionProfile({
  avatarSrc,
  dollarAmount,
  pointAmount,
}: ProfileProps) {
  return (
    <div className="flex items-center p-6 rounded-2xl bg-[#333] gap-4">
      <Avatar size="large" src={avatarSrc} />
      <div className="flex flex-col font-sora text-white text-base gap-y-3">
        <div>{numberToCurrencyFormatter.format(pointAmount)} POINTS</div>

        <div className="font-bold">
          {dollarAmount && (
            <>~${numberToCurrencyFormatter.format(dollarAmount)}</>
          )}
        </div>
      </div>
    </div>
  );
}
