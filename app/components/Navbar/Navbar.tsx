"use client";

import { SunsetBanner } from "@/components/SunsetBanner";
import { useSyncHeight } from "@/hooks/useSyncHeight";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Link from "next/link";
import { useRef, useState } from "react";

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
  const { user } = useDynamicContext();
  const [isOpen, setIsOpen] = useState(false);

  const navContainerRef = useRef(null);
  const shimHeight = useSyncHeight(navContainerRef, 150);

  const closeQuickProfile = () => {
    setIsOpen(false);
  };

  const openQuickProfile = () => {
    setIsOpen(true);
  };

  return (
    <>
      <div
        className="top-0 sticky flex-col fixed invisible"
        style={{ height: shimHeight }}
      ></div>

      <div
        className="top-0 flex flex-col fixed top-0 z-50"
        ref={navContainerRef}
      >
        <SunsetBanner className="w-screen max-w-lg bg-[#ED6A5A]" />
        <nav className="flex flex-col justify-between w-full items-center px-4 bg-gray-900 z-20 max-w-lg">
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
      </div>
    </>
  );
}
