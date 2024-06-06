"use client";

import { numberToCurrencyFormatter } from "@/app/utils/currency";
import classNames from "classnames";
import { Avatar } from "../Avatar/Avatar";
import { CloseIcon } from "../Icons/CloseIcon";
import Link from "next/link";

type ProfileProps = {
  pointAmount?: number;
  bonkAmount?: number;
  dollarAmount?: number;
  solAmount?: number;
  avatarSrc: string;
  onClose?: () => void;
  className?: string;
};

export function TransactionProfile({
  avatarSrc,
  bonkAmount,
  dollarAmount,
  solAmount,
  pointAmount,
  onClose,
  className,
}: ProfileProps) {
  return (
    <div
      className={classNames("flex p-6 rounded-2xl bg-black gap-4", className)}
    >
      <Link href="/application/profile">
        <Avatar size="large" src={avatarSrc} />
      </Link>
      <div className="flex flex-col font-sora text-white text-base gap-y-3 self-center flex-grow">
        {typeof pointAmount === "number" && (
          <div className="whitespace-nowrap">
            {numberToCurrencyFormatter.format(pointAmount)} POINTS
          </div>
        )}

        {typeof bonkAmount === "number" && (
          <div className="whitespace-nowrap">
            {numberToCurrencyFormatter.format(bonkAmount)} BONK
          </div>
        )}

        <div className="font-bold">
          {dollarAmount && (
            <>~${numberToCurrencyFormatter.format(dollarAmount)}</>
          )}
          {solAmount && <>{numberToCurrencyFormatter.format(solAmount)} SOL</>}
        </div>
      </div>
      {onClose && (
        <button className="self-start" onClick={onClose}>
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
