"use client";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "../Avatar/Avatar";
import { ChompFlatIcon } from "../Icons/ChompFlatIcon";
import { UnreadIcon } from "../Icons/UnreadIcon";
import { QuickViewProfile } from "../QuickViewProfile/QuickViewProfile";
import { TransactionData } from "../TransactionsTable/TransactionRow/TransactionRow";

export type NavbarProps = {
  avatarSrc: string;
  onNotificationClick?: () => {};
  address: string;
  transactions: TransactionData[];
  bonkBalance: number;
  solBalance: number;
};

export function Navbar({
  avatarSrc,
  transactions,
  onNotificationClick,
  address,
  bonkBalance,
  solBalance,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeQuickProfile = () => {
    setIsOpen(false);
  };

  const openQuickProfile = () => {
    setIsOpen(true);
  };

  return (
    <nav className="bg-btn-text-primary flex justify-between w-full py-3 items-center">
      <Link href="/application">
        <ChompFlatIcon fill="#fff" />
      </Link>
      <div className="flex gap-6 items-center">
        <Link
          className="font-sora text-xs text-chomp-purple underline"
          href="#"
        >
          Feedback
        </Link>
        <button onClick={onNotificationClick}>
          <UnreadIcon />
        </button>
        <button onClick={openQuickProfile}>
          <Avatar src={avatarSrc} size="small" />
        </button>
        <QuickViewProfile
          isOpen={isOpen}
          onClose={closeQuickProfile}
          transactions={transactions}
          avatarSrc={avatarSrc}
          address={address}
          bonkAmount={bonkBalance}
          solAmount={solBalance}
        />
      </div>
    </nav>
  );
}
