"use client";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "../Avatar/Avatar";
import { ChompFlatIcon } from "../Icons/ChompFlatIcon";
import { QuickViewProfile } from "../QuickViewProfile/QuickViewProfile";
import { TransactionData } from "../TransactionsTable/TransactionRow/TransactionRow";

export type NavbarProps = {
  avatarSrc: string;
  address: string;
  transactions: TransactionData[];
  bonkBalance: number;
  solBalance: number;
};

export function Navbar({
  avatarSrc,
  transactions,
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
    <nav className="flex justify-between w-full py-3 items-center fixed top-0 left-1/2 -translate-x-1/2 px-4 bg-[#0D0D0D] z-10 max-w-lg">
      <Link href="/application">
        <ChompFlatIcon fill="#fff" />
      </Link>
      <div className="flex gap-6 items-center">
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
