import { useToast } from "@/app/providers/ToastProvider";
import { copyTextToClipboard } from "@/app/utils/clipboard";
import { formatAddress } from "@/app/utils/wallet";
import Image from "next/image";
import Tabs from "../Tabs/Tabs";

type BotRevealClaimProps = {
  children: React.ReactNode;
  activeTab: number;
  setActiveTab: (tab: number) => void;
  wallet: string;
};

export default function BotRevealClaim({
  children,
  activeTab,
  setActiveTab,
  wallet,
}: BotRevealClaimProps) {
  const { successToast } = useToast();
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
          className="w-fit px-3 py-1 text-sm bg-neutral-700 border border-neutral-500 rounded-2xl"
          onClick={() => {
            copyTextToClipboard(wallet);
            successToast("Address copied successfully!");
          }}
        >
          {formatAddress(wallet)}
        </button>
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
