import { useToast } from "@/app/providers/ToastProvider";
import { copyTextToClipboard } from "@/app/utils/clipboard";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import { formatAddress } from "@/app/utils/wallet";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import classNames from "classnames";
import { MouseEventHandler, useRef } from "react";
import { Avatar } from "../Avatar/Avatar";
import { Button } from "../Button/Button";
import { CloseIcon } from "../Icons/CloseIcon";
import { CopyIcon } from "../Icons/CopyIcon";
import { ReactPortal } from "../ReactPortal/ReactPortal";

type WalletMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  wallet: string;
  userBalance: {
    solBalance: number;
    bonkBalance: number;
  };
};

export default function WalletMenu({
  isOpen,
  onClose,
  wallet,
  userBalance,
}: WalletMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { successToast } = useToast();

  if (!isOpen) {
    return null;
  }

  const handleClickoutside: MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.target === ref.current) {
      onClose();
    }
  };

  return (
    <ReactPortal>
      <div
        ref={ref}
        onClick={handleClickoutside}
        className="fixed top-0 h-full w-full flex justify-center bg-black bg-opacity-80"
      >
        <div className="bg-search-gray w-4/5 h-fit rounded-2xl p-4  mt-8">
          <div className="flex p-6 rounded-2xl bg-black gap-4">
            <Avatar size="large" src={AvatarPlaceholder.src} />
            <div className="flex flex-col font-sora text-white text-base self-center flex-grow">
              <div className="whitespace-nowrap opacity-80">
                {numberToCurrencyFormatter.format(userBalance?.solBalance)} SOL
              </div>
              <div className="whitespace-nowrap opacity-80">
                {numberToCurrencyFormatter.format(
                  Math.floor(userBalance?.bonkBalance),
                )}{" "}
                BONK
              </div>
            </div>
            <button className="self-start" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
          <div
            className={classNames(
              "flex items-center justify-between bg-pink px-4 py-2 rounded-lg gap-6 mt-4",
            )}
          >
            {formatAddress(wallet)}
            <Button
              isPill
              className="!p-0 !w-[38px] !h-[38px] bg-[#A3A3EC] border-none"
              onClick={() => {
                copyTextToClipboard(wallet);
                successToast("Address copied successfully!");
              }}
            >
              <CopyIcon />
            </Button>
          </div>
        </div>
      </div>
    </ReactPortal>
  );
}
