"use client";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Link from "next/link";
import { Button } from "../Button/Button";
import { Flyout } from "../Flyout/Flyout";
import { HalfArrowRightIcon } from "../Icons/HalfArrowRightIcon";
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
  const { handleLogOut } = useDynamicContext();
  return (
    <Flyout isOpen={isOpen} onClose={onClose}>
      <div className="p-4 flex flex-col justify-between h-full">
        <div>
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
          <TransactionsTable
            transactions={transactions}
            className="max-h-[calc(100vh-296px)] my-4"
          />
        </div>
      </div>
    </Flyout>
  );
}
