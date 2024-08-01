import Image from "next/image";
import { RiWallet3Fill } from "react-icons/ri";
import Tabs from "../Tabs/Tabs";

type BotRevealClaimProps = {
  children: React.ReactNode;
  activeTab: number;
  setActiveTab: (tab: number) => void;
};

export default function BotRevealClaim({
  children,
  activeTab,
  setActiveTab,
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
        <RiWallet3Fill size={20} />
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
