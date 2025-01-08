import { createBuyCreidtsTx } from "@/app/actions/credits/createChainTx";
import { useToast } from "@/app/providers/ToastProvider";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useRouter } from "next-nprogress-bar";
import React, { useState } from "react";

import { CloseIcon } from "../Icons/CloseIcon";
import { Button } from "../ui/button";
import { Drawer, DrawerContent } from "../ui/drawer";

type BuyCreditsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  creditsToBuy: number;
  deckId: number;
};

function BuyCreditsDrawer({
  isOpen,
  onClose,
  creditsToBuy,
  deckId,
}: BuyCreditsDrawerProps) {
  const solPricePerCredit = process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT;
  const totalSolCost = Number(solPricePerCredit) * creditsToBuy;

  const [isProcessingTx, setIsProcessingTx] = useState(false);

  const { promiseToast } = useToast();

  const router = useRouter();

  const processTx = async () => {
    setIsProcessingTx(true);
    await promiseToast(createBuyCreidtsTx(deckId), {
      error:
        "Unable to prepare transaction. Don't worry, nothing was submitted on-chain. Please try again",
      success: "Transaction Successfull",
      loading: "Preparing Transaction",
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
          {creditsToBuy} Credits ~${totalSolCost} SOL
        </span>
        <Button onClick={processTx} disabled={isProcessingTx}>
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