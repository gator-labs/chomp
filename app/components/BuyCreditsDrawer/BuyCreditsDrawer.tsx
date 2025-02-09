import { TELEGRAM_SUPPORT_LINK } from "@/app/constants/support";
import {
  errorToastLayout,
  successToastLayout,
  toastOptions,
} from "@/app/providers/ToastProvider";
import { useCreditPurchase } from "@/hooks/useCreditPurchase";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { DialogTitle } from "@radix-ui/react-dialog";
import Decimal from "decimal.js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import ChompFullScreenLoader from "../ChompFullScreenLoader/ChompFullScreenLoader";
import { CloseIcon } from "../Icons/CloseIcon";
import { Button } from "../ui/button";
import { Drawer, DrawerContent } from "../ui/drawer";

Decimal.set({ toExpNeg: -128 });

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
  const [isLoading, setIsLoading] = useState(false);
  const solPricePerCredit = process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT;
  const totalSolCost = new Decimal(solPricePerCredit!)
    .mul(creditsToBuy)
    .toString();
  const router = useRouter();
  const { primaryWallet } = useDynamicContext();

  const { isProcessingTx, processCreditPurchase } = useCreditPurchase({
    primaryWallet,
  });

  const buyCredits = async () => {
    setIsLoading(true);
    try {
      const result = await processCreditPurchase(creditsToBuy);

      if (result && "error" in result) {
        toast(errorToastLayout(result.error), toastOptions);
        return;
      }

      toast(successToastLayout("Credits purchased successfully"), toastOptions);
      onClose();
      router.refresh();
    } catch {
      toast(
        errorToastLayout(
          <div>
            <p>Transaction failed</p>
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isProcessingTx && (
        <ChompFullScreenLoader
          isLoading={isProcessingTx}
          loadingMessage="Processing transaction..."
        />
      )}
      <Drawer
        open={isOpen}
        onOpenChange={async (open: boolean) => {
          if (!open && !isProcessingTx) {
            onClose();
          }
        }}
      >
        <DrawerContent className="p-6 flex flex-col gap-2">
          <DialogTitle>
            <div className="flex justify-between items-center mb-2">
              <p className="text-base text-secondary font-bold">
                Buy {creditsToBuy} More Credit{creditsToBuy !== 1 ? "s" : ""}?
              </p>
              <div onClick={onClose}>
                <CloseIcon width={16} height={16} />
              </div>
            </div>
          </DialogTitle>
          <div className="space-y-4">
            <p>Credits are required to answer this deck.</p>
            <p>
              You&apos;ll get your Credits back for giving the best answer for
              the first order question, and up to an additional BONK per
              question depending on the accuracy of your second order response.
            </p>
            <p>
              To learn more about rewards, read our documentation{" "}
              <a
                href="https://docs.chomp.games/how-to-earn"
                target="_blank"
                className="text-secondary underline"
              >
                here
              </a>
            </p>
          </div>
          <span className="bg-gray-500 w-fit px-2 py-1 my-2 text-sm font-medium rounded">
            {creditsToBuy} Credit{creditsToBuy !== 1 ? "s" : ""} ~ $
            {totalSolCost} SOL
          </span>
          <Button
            onClick={buyCredits}
            disabled={isProcessingTx || isLoading}
            isLoading={isProcessingTx || isLoading}
          >
            Buy Credits
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isProcessingTx || isLoading}
          >
            Close
          </Button>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default BuyCreditsDrawer;
