"use client";

import { TELEGRAM_SUPPORT_LINK } from "@/app/constants/support";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { Button } from "../Button/Button";
import { Flyout } from "../Flyout/Flyout";
import { HalfArrowRightIcon } from "../Icons/HalfArrowRightIcon";
import TelegramIcon from "../Icons/TelegramIcon";
import XIcon from "../Icons/XIcon";
import { TransactionProfile } from "../TransactionProfile/TransactionProfile";
import { TransactionData } from "../TransactionsTable/TransactionRow/TransactionRow";
import { TransactionsTable } from "../TransactionsTable/TransactionsTable";
import { WalletWidget } from "../WalletWidget/WalletWidget";

type QuickViewProfileProps = {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransactionData[];
  bonkAmount?: number;
  solAmount?: number;
  dollarAmount?: number;
  avatarSrc: string;
  address: string;
};

export function QuickViewProfile({
  isOpen,
  onClose,
  avatarSrc,
  bonkAmount,
  dollarAmount,
  solAmount,
  address,
  transactions,
}: QuickViewProfileProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);

  return (
    <Flyout isOpen={isOpen} onClose={onClose}>
      <div className="p-4 flex flex-col justify-start h-full">
        <TransactionProfile
          avatarSrc={avatarSrc}
          bonkAmount={bonkAmount}
          dollarAmount={dollarAmount}
          solAmount={solAmount}
          onClose={onClose}
          className="mb-4"
        />
        <WalletWidget address={address} className="mb-4" />
        <Link href="/tutorial">
          <Button
            size="small"
            variant="black"
            className="flex justify-between text-white text-base"
          >
            View tutorial <HalfArrowRightIcon />
          </Button>
        </Link>
        <TransactionsTable transactions={transactions} />
        <div className="flex gap-2 items-center mt-auto">
          <div className="p-2 rounded-lg bg-gray-500 flex gap-2">
            <a
              href={TELEGRAM_SUPPORT_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              <TelegramIcon />
            </a>
            <a
              href="https://x.com/chompdotgames"
              target="_blank"
              rel="noopener noreferrer"
            >
              <XIcon />
            </a>
          </div>
          <p className="text-sm font-normal !text-xs">
            Follow our socials for the latest news and special announcements!
          </p>
        </div>
      </div>
    </Flyout>
  );
}
