"use client";
import { useToast } from "@/app/providers/ToastProvider";
import { copyTextToClipboard } from "@/app/utils/clipboard";
import { formatAddress } from "@/app/utils/wallet";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import classNames from "classnames";
import { Button } from "../Button/Button";
import { CopyIcon } from "../Icons/CopyIcon";
import { ExitIcon } from "../Icons/ExitIcon";

type WalletWidgetProps = {
  address: string;
  className?: string;
};

export function WalletWidget({ address, className }: WalletWidgetProps) {
  const { handleLogOut } = useDynamicContext();
  const { infoToast } = useToast();
  const handleCopyToClipboard = async () => {
    await copyTextToClipboard(address);
    infoToast(
      "Copied to clipboard",
      `Copied ${formatAddress(address)} to clipboard`,
    );
  };

  return (
    <>
      <div
        className={classNames(
          "flex items-center justify-between bg-pink px-4 py-2 rounded-lg gap-6",
          className,
        )}
      >
        <div className=" text-[#171616] text-base">
          {formatAddress(address)}
        </div>
        <div className="flex gap-x-2">
          <Button
            isPill
            className="!p-0 !w-[38px] !h-[38px] bg-secondary border-none"
            onClick={handleCopyToClipboard}
          >
            <CopyIcon />
          </Button>
          <Button
            onClick={handleLogOut}
            isPill
            className="!p-0 !w-[38px] !h-[38px] bg-secondary border-none"
          >
            <ExitIcon />
          </Button>
        </div>
      </div>
    </>
  );
}
