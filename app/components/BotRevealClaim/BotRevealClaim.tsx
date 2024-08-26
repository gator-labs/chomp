import { WalletIcon } from "@/app/components/Icons/WalletIcon";
import Image from "next/image";
import { useState } from "react";
import Tabs from "../Tabs/Tabs";
import WalletMenu from "../WalletMenu/WalletMenu";

type BotRevealClaimProps = {
  children: React.ReactNode;
  activeTab: number;
  setActiveTab: (tab: number) => void;
  wallet: string;
  userBalance: {
    solBalance: number;
    bonkBalance: number;
  };
  isFetchingBalance: boolean;
};

export default function BotRevealClaim({
  children,
  activeTab,
  setActiveTab,
  wallet,
  userBalance,
  isFetchingBalance
}: BotRevealClaimProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeQuickProfile = () => {
    setIsOpen(false);
  };

  const openQuickProfile = () => {
    setIsOpen(true);
  };

  return (
    <>
      <span className="flex justify-between w-full py-3 items-center fixed top-0 left-1/2 -translate-x-1/2 px-4 bg-[#0D0D0D] z-10 max-w-lg">
        <Image
          src="/images/gator-head-white.png"
          width={50}
          height={50}
          alt="chomp-head"
        />
        <button
          className="text-sm cursor-pointer"
          onClick={() => {
            openQuickProfile();
          }}
        >
          <WalletIcon width={30} height={30} />
        </button>
        <WalletMenu
          isOpen={isOpen}
          onClose={closeQuickProfile}
          wallet={wallet}
          userBalance={userBalance}
          isFetchingBalance={isFetchingBalance}
        />
      </span>
      <div className="space-y-6 flex flex-col p-5 pt-[4.5rem] items-start justify-center">
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
    </>
  );
}
