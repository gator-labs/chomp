import Image from "next/image";
import Tabs from "../Tabs/Tabs";
import { formatAddress } from "@/app/utils/wallet";

type BotRevealClaimProps = {
  children: React.ReactNode;
  activeTab: number;
  setActiveTab: (tab: number) => void;
  wallet: string
};

export default function BotRevealClaim({
  children,
  activeTab,
  setActiveTab,
  wallet
}: BotRevealClaimProps) {
  return (
    <div className="space-y-6 flex flex-col p-5 items-start justify-center">
      <span className="flex w-full items-center justify-between">
        <Image
          src="/images/gator-head-white.png"
          width={50}
          height={50}
          alt="chomp-head"
        />
        <p className="w-fit px-3 py-1 bg-neutral-700 border border-neutral-500 rounded-2xl">{formatAddress(wallet)}</p>
      </span>
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
