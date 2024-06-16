"use client";
import { RevealedQuestion } from "@/app/queries/home";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "../Avatar/Avatar";
import { ChompFlatIcon } from "../Icons/ChompFlatIcon";
import NotificationCenter from "../NotificationCenter/NotificationCenter";
import { QuickViewProfile } from "../QuickViewProfile/QuickViewProfile";
import { TransactionData } from "../TransactionsTable/TransactionRow/TransactionRow";

export type NavbarProps = {
  avatarSrc: string;
  onNotificationClick?: () => {};
  address: string;
  transactions: TransactionData[];
  bonkBalance: number;
  solBalance: number;
  revealedQuestions: RevealedQuestion[];
};

export function Navbar({
  avatarSrc,
  transactions,
  onNotificationClick,
  address,
  bonkBalance,
  solBalance,
  revealedQuestions,
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
        {/* <Link
          className="font-sora text-xs text-chomp-purple underline"
          href="#"
        >
          Feedback
        </Link>
        <button onClick={onNotificationClick}>
          <UnreadIcon />
        </button> */}
        <div className="flex items-center justify-end gap-8">
          <NotificationCenter questions={revealedQuestions} />
          <button onClick={openQuickProfile}>
            <Avatar src={avatarSrc} size="small" />
          </button>
        </div>
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
