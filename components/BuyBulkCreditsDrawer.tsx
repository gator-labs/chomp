import ChompFullScreenLoader from "@/app/components/ChompFullScreenLoader/ChompFullScreenLoader";
import { CloseIcon } from "@/app/components/Icons/CloseIcon";
import { Button } from "@/app/components/ui/button";
import { Drawer, DrawerContent } from "@/app/components/ui/drawer";
import { TELEGRAM_SUPPORT_LINK } from "@/app/constants/support";
import {
  errorToastLayout,
  successToastLayout,
  toastOptions,
} from "@/app/providers/ToastProvider";
import { useCreditPurchase } from "@/hooks/useCreditPurchase";
import { ChainEnum } from "@dynamic-labs/sdk-api";
import { useTokenBalances } from "@dynamic-labs/sdk-react-core";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { DialogTitle } from "@radix-ui/react-dialog";
import Decimal from "decimal.js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

Decimal.set({ toExpNeg: -128 });

const MAX_SOL_SPEND = 1000;

type BuyBulkCreditsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

function BuyBulkCreditsDrawer({ isOpen, onClose }: BuyBulkCreditsDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [creditsToBuy, setCreditsToBuy] = useState<number | undefined>(
    undefined,
  );
  const solPricePerCredit = process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT;
  const totalSolCost = new Decimal(solPricePerCredit!).mul(creditsToBuy ?? 0);
  const router = useRouter();
  const { primaryWallet } = useDynamicContext();

  const { isProcessingTx, processCreditPurchase } = useCreditPurchase({
    primaryWallet,
  });

  const { tokenBalances } = useTokenBalances({
    chainName: ChainEnum.Sol,
    tokenAddresses: ["11111111111111111111111111111111"],
    accountAddress: primaryWallet?.address,
    includeFiat: true,
    includeNativeBalance: true,
  });

  const solBalance = tokenBalances?.find((bal) => bal.symbol == "SOL");

  const hasInsufficientFunds = totalSolCost.greaterThanOrEqualTo(
    solBalance?.balance ?? 0,
  );

  const updateCreditsToBuy = (value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0 || !Number.isFinite(1000))
      setCreditsToBuy(undefined);
    else setCreditsToBuy(numValue);
  };

  const incrementCreditsToBuy = () => {
    if (creditsToBuy === undefined) setCreditsToBuy(0);
    else setCreditsToBuy(creditsToBuy + 1);
  };

  const decrementCreditsToBuy = () => {
    if (creditsToBuy === undefined || creditsToBuy === 0) return;
    setCreditsToBuy(creditsToBuy - 1);
  };

  const buyCredits = async () => {
    setIsLoading(true);
    try {
      const result = await processCreditPurchase(creditsToBuy ?? 0);

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
              <p className="text-base text-secondary font-bold">Buy Credits</p>
              <div onClick={onClose}>
                <CloseIcon width={16} height={16} />
              </div>
            </div>
          </DialogTitle>
          <div className="text-sm font-medium">
            <p>Buy Credits for ${solPricePerCredit} each.</p>
          </div>
          <hr className="border-gray-600 my-2 p-0" />
          <div className="grid grid-cols-[1fr_auto_auto] gap-2">
            <input
              id="creditsToBuy"
              type="text"
              inputMode="numeric"
              pattern="/^[0-9]*$/"
              step="1"
              min="1"
              max={solBalance?.balance ?? 0}
              required
              placeholder="0"
              className="block h-full w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
              value={creditsToBuy}
              disabled={isProcessingTx || isLoading}
              onChange={(e) => updateCreditsToBuy(e.target.value)}
            />
            <Button
              className="min-w-[3.5em]"
              disabled={
                creditsToBuy === 0 ||
                creditsToBuy === undefined ||
                isProcessingTx ||
                isLoading
              }
              onClick={() => decrementCreditsToBuy()}
            >
              -
            </Button>
            <Button
              className="min-w-[3.5em]"
              disabled={hasInsufficientFunds || isProcessingTx || isLoading}
              onClick={() => incrementCreditsToBuy()}
            >
              +
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <span className="flex justify-between my-2 text-sm font-medium">
              <span>Subtotal</span>
              <span>
                {hasInsufficientFunds ? (
                  <span>Insufficient funds</span>
                ) : (
                  <>
                    {totalSolCost.toString()} SOL{" "}
                    {solBalance?.price !== undefined && (
                      <span className="text-gray-500">
                        (~$
                        {totalSolCost
                          .mul(solBalance?.price ?? 0)
                          .toDP(2)
                          .toNumber()
                          .toLocaleString("en-US")}
                        )
                      </span>
                    )}
                  </>
                )}
              </span>
            </span>
            <Button
              onClick={buyCredits}
              disabled={
                hasInsufficientFunds ||
                creditsToBuy === undefined ||
                creditsToBuy === 0 ||
                isProcessingTx ||
                isLoading
              }
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
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default BuyBulkCreditsDrawer;
