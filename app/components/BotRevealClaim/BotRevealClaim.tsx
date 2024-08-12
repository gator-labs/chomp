import { useToast } from "@/app/providers/ToastProvider";
import { copyTextToClipboard } from "@/app/utils/clipboard";
import { formatAddress } from "@/app/utils/wallet";
import { WalletIcon } from "@/app/components/Icons/WalletIcon";
import Image from "next/image";
import Tabs from "../Tabs/Tabs";
import WalletPopUp from "../Bot/WalletPopUp/WalletPopUp";
import { useState } from "react";

type BotRevealClaimProps = {
  children: React.ReactNode;
  activeTab: number;
  setActiveTab: (tab: number) => void;
  wallet: string;
  userBalance: {
    solBalance: number,
    bonkBalance: number
  }
};

export default function BotRevealClaim({
  children,
  activeTab,
  setActiveTab,
  wallet,
  userBalance
}: BotRevealClaimProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeQuickProfile = () => {
    setIsOpen(false);
  };

  const openQuickProfile = () => {
    setIsOpen(true);
  };

  return (
    <div className="space-y-6 flex flex-col p-5 items-start justify-center">
      <span className="flex w-full items-center justify-between">
        <Image
          src="/images/gator-head-white.png"
          width={50}
          height={50}
          alt="chomp-head"
        />
        <button
          className="text-sm cursor-pointer"
          onClick={() => {
            openQuickProfile()
          }}
        >
          <WalletIcon />
        </button>
      </span>
      <WalletPopUp isOpen={isOpen}
        onClose={closeQuickProfile} wallet={wallet} userBalance={userBalance} />
      <p className="text-2xl font-bold">Reveal and Claim</p>
      <p>
        You can view and reveal all cards that are ready to reveal below. Only
        cards with correct answers will Claim tab.
      </p>
      <Tabs
        tabs={["Reveal & Claim", "History"]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {children}
    </div>
  );
}
