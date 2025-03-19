"use client";

import { redirectToMainDomain } from "@/app/utils/router";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
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
  isUserLoggedIn?: boolean;
};

export function Navbar({
  avatarSrc,
  transactions,
  address,
  bonkBalance,
  solBalance,
  isUserLoggedIn = true,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeQuickProfile = () => {
    setIsOpen(false);
  };

  const openQuickProfile = () => {
    setIsOpen(true);
  };

  const handleChompIconClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    redirectToMainDomain();
  };

  return (
    <nav className="flex justify-between w-full py-3 items-center fixed top-0 left-1/2 -translate-x-1/2 px-4 bg-gray-900 z-10 max-w-lg">
      <Link
        href={isUserLoggedIn ? "/application" : "#"}
        passHref
        legacyBehavior
      >
        <a onClick={isUserLoggedIn ? undefined : handleChompIconClick}>
          <ChompFlatIcon fill="#fff" />
        </a>
      </Link>
      {!isUserLoggedIn ? null : (
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
    </nav>
  );
}
