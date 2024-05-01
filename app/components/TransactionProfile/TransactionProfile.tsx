"use client";

import { numberToCurrencyFormatter } from "@/app/utils/currency";
import { Avatar } from "../Avatar/Avatar";

type ProfileProps = {
  bonkAmount: number;
  dollarAmount: number;
  avatarSrc: string;
};

export function TransactionProfile({
  avatarSrc,
  dollarAmount,
  bonkAmount,
}: ProfileProps) {
  return (
    <div className="flex justify-between items-center p-6 rounded-2xl bg-[#333] gap-4">
      <Avatar size="large" src={avatarSrc} />
      <div className="flex flex-col font-sora text-white text-base gap-y-3">
        <div>{numberToCurrencyFormatter.format(bonkAmount)} $BONK</div>
        <div className="font-bold">
          ~${numberToCurrencyFormatter.format(dollarAmount)}
        </div>
      </div>
    </div>
  );
}
