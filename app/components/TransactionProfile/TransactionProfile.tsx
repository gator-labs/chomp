"use client";

import { numberToCurrencyFormatter } from "@/app/utils/currency";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import classNames from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "../Avatar/Avatar";
import { CloseIcon } from "../Icons/CloseIcon";

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
  const pathname = usePathname();
  console.log({ pathname });
  return (
    <div
      className={classNames("flex p-6 rounded-2xl bg-black gap-4", className)}
    >
      <Link
        onClick={() => {
          if (pathname.endsWith("dashboard")) onClose?.();
        }}
        href="/application/profile/dashboard"
      >
        <Avatar size="large" src={avatarSrc || AvatarPlaceholder.src} />
      </Link>
      <div className="flex flex-col font-sora text-white text-base gap-y-3 self-center flex-grow">
        {typeof pointAmount === "number" && (
          <div className="whitespace-nowrap">
            {numberToCurrencyFormatter.format(pointAmount)} POINTS
          </div>
        )}

        {typeof bonkAmount === "number" && (
          <div className="whitespace-nowrap">
            {numberToCurrencyFormatter.format(Math.floor(bonkAmount))} BONK
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
