"use client";

import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Link from "next/link";
import { useState } from "react";

import { Avatar } from "../Avatar/Avatar";
import { ChompFlatIcon } from "../Icons/ChompFlatIcon";
import { QuickViewProfile } from "../QuickViewProfile/QuickViewProfile";
import { TransactionData } from "../TransactionsTable/TransactionRow/TransactionRow";
import { SunsetBanner } from "@/components/SunsetBanner";

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
  const { user } = useDynamicContext();
  const [isOpen, setIsOpen] = useState(false);

  const closeQuickProfile = () => {
    setIsOpen(false);
  };

  const openQuickProfile = () => {
    setIsOpen(true);
  };

  return (
    <nav className="flex flex-col justify-between w-full items-center fixed top-0 left-1/2 -translate-x-1/2 px-4 bg-gray-900 z-20 max-w-lg">
      <SunsetBanner />
      <div className="flex justify-between w-full py-3 items-center px-4 bg-gray-900 z-20 max-w-lg">
      <Link href={user ? "/application" : "https://chomp.games/"}>
        <ChompFlatIcon fill="#fff" />
      </Link>
      {!user ? null : (
        <div className="flex gap-6 items-center">
          <button onClick={openQuickProfile}>
            <Avatar
              src={avatarSrc || AvatarPlaceholder.src}
              size="small"
              className="border-white"
            />
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
      )}
      </div>
    </nav>
  );
}
