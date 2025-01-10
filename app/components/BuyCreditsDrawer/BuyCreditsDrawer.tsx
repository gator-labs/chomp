import { createBuyCreditsTx } from "@/app/actions/credits/createChainTx";
import { TELEGRAM_SUPPORT_LINK } from "@/app/constants/support";
import {
  errorToastLayout,
  successToastLayout,
  toastOptions,
} from "@/app/providers/ToastProvider";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useRouter } from "next-nprogress-bar";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";

import { CloseIcon } from "../Icons/CloseIcon";
import { Button } from "../ui/button";
import { Drawer, DrawerContent } from "../ui/drawer";

type BuyCreditsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  creditsToBuy: number;
};

function BuyCreditsDrawer({
  isOpen,
  onClose,
  creditsToBuy,
}: BuyCreditsDrawerProps) {
  const solPricePerCredit = process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT;
  const totalSolCost = Number(solPricePerCredit) * creditsToBuy;

  const [isProcessingTx, setIsProcessingTx] = useState(false);

  const router = useRouter();

  const processTx = async () => {
    setIsProcessingTx(true);

    await createBuyCreditsTx(creditsToBuy)
      .then(() => {
        toast(successToastLayout("Transaction Successful"), toastOptions);
      })
      .catch(() => {
        toast(
          errorToastLayout(
            <div>
              <p>Transaction Failed!</p>
              <p>
                Please try again. If this issue keeps happening, let us know on{" "}
                <Link
                  href={TELEGRAM_SUPPORT_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-200 hover:underline"
                >
                  Telegram
                </Link>
              </p>
            </div>,
          ),
          toastOptions,
        );
      });
    setIsProcessingTx(false);
    onClose();
    router.refresh();
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={async (open: boolean) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DrawerContent className="p-6 flex flex-col gap-2">
        <DialogTitle>
          <div className="flex justify-between items-center mb-2">
            <p className="text-base text-secondary font-bold">
              Buy {creditsToBuy} More Credits?
            </p>
            <div onClick={onClose}>
              <CloseIcon width={16} height={16} />
            </div>
          </div>
        </DialogTitle>
        <p>
          Credits are required to answer this deck. <br /> <br />
          <b className="text-chomp-blue-light">Premium decks</b> allow you to
          earn BONK rewards when answers are correct.
        </p>
        <span className="bg-gray-500 w-fit px-2 py-1 my-2 text-sm font-medium rounded">
          {creditsToBuy} Credits ~ ${totalSolCost} SOL
        </span>
        <Button
          onClick={processTx}
          disabled={isProcessingTx}
          isLoading={isProcessingTx}
        >
          Buy Credits
        </Button>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </DrawerContent>
    </Drawer>
  );
}

export default BuyCreditsDrawer;
