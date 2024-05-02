"use client";
import { copyTextToClipboard } from "@/app/utils/clipboard";
import { ONE_SECOND_IN_MILISECONDS } from "@/app/utils/dateUtils";
import { formatAddress } from "@/app/utils/wallet";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { Button } from "../Button/Button";
import { CopyIcon } from "../Icons/CopyIcon";
import { ExitIcon } from "../Icons/ExitIcon";

type WalletWidgetProps = {
  address: string;
};

export function WalletWidget({ address }: WalletWidgetProps) {
  const { handleLogOut } = useDynamicContext();
  const handleCopyToClipboard = async () => {
    await copyTextToClipboard(address);
    toast.info(`Copied ${address} to clipboard`);
  };

  return (
    <>
      <div className="flex items-center justify-between bg-pink px-4 py-2 rounded-lg gap-6">
        <div className="font-sora text-[#171616] text-base">
          {formatAddress(address)}
        </div>
        <div className="flex gap-x-2">
          <Button
            isPill
            className="!p-0 !w-[38px] !h-[38px] bg-[#A3A3EC] border-none"
            onClick={handleCopyToClipboard}
          >
            <CopyIcon />
          </Button>
          <Button
            onClick={handleLogOut}
            isPill
            className="!p-0 !w-[38px] !h-[38px] bg-[#A3A3EC] border-none"
          >
            <ExitIcon />
          </Button>
        </div>
      </div>
      <ToastContainer
        position="bottom-center"
        stacked
        autoClose={ONE_SECOND_IN_MILISECONDS}
      />
    </>
  );
}
