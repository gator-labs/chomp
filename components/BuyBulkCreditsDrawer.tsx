import { getCreditPackList } from "@/actions/credits/getPackList";
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
import { useSolBalance } from "@/hooks/useSolBalance";
import { ChainEnum } from "@dynamic-labs/sdk-api";
import { useTokenBalances } from "@dynamic-labs/sdk-react-core";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { CreditPack } from "@prisma/client";
import { Dialog, DialogTitle } from "@radix-ui/react-dialog";
import Decimal from "decimal.js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import CreditPackList from "./CreditPackList";

const MAX_CREDITS = 100000;

Decimal.set({ toExpNeg: -128 });

type BuyBulkCreditsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

function BuyBulkCreditsDrawer({ isOpen, onClose }: BuyBulkCreditsDrawerProps) {
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<CreditPack | null>(null);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
  const [creditsToBuy, setCreditsToBuy] = useState<number | undefined>(
    undefined,
  );

  const solPricePerCredit = process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT;
  const totalSolCost = new Decimal(
    selectedPack !== null ? selectedPack.costPerCredit : solPricePerCredit!,
  ).mul(creditsToBuy ?? 0);
  const router = useRouter();
  const { primaryWallet } = useDynamicContext();

  const { isProcessingTx, processCreditPurchase, abortCreditPurchase, txHash } =
    useCreditPurchase();

  const { tokenBalances } = useTokenBalances({
    chainName: ChainEnum.Sol,
    tokenAddresses: ["11111111111111111111111111111111"],
    accountAddress: primaryWallet?.address,
    includeFiat: true,
    includeNativeBalance: true,
  });

  const solPrice = tokenBalances?.find((bal) => bal.symbol == "SOL");
  const { hasBalanceWithBuffer } = useSolBalance(primaryWallet);

  const hasSufficientFunds = hasBalanceWithBuffer(totalSolCost);

  const updateCreditsToBuy = (value: string) => {
    const numValue = Number(value);
    if (selectedPackId !== null) {
      setSelectedPack(null);
      setSelectedPackId(null);
    }
    if (isNaN(numValue) || numValue < 0 || !Number.isFinite(numValue))
      setCreditsToBuy(undefined);
    else setCreditsToBuy(numValue);
  };

  const incrementCreditsToBuy = () => {
    if (selectedPackId !== null) {
      setSelectedPack(null);
      setSelectedPackId(null);
      setCreditsToBuy(1);
    } else {
      if (creditsToBuy === undefined) setCreditsToBuy(1);
      else setCreditsToBuy(creditsToBuy + 1);
    }
  };

  const decrementCreditsToBuy = () => {
    if (selectedPackId !== null) {
      setSelectedPack(null);
      setSelectedPackId(null);
      setCreditsToBuy(1);
    } else {
      if (creditsToBuy === undefined || creditsToBuy === 0) return;
      setCreditsToBuy(creditsToBuy - 1);
    }
  };

  const buyCredits = async () => {
    setIsLoading(true);
    setIsTimedOut(false);

    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }

    try {
      const result = await processCreditPurchase(
        creditsToBuy ?? 0,
        selectedPack,
      );

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

  const handleSelectPack = (packId: string | null) => {
    if (packId !== null) {
      const newPack = packs.find((pack) => pack.id == packId);
      if (newPack) {
        setCreditsToBuy(newPack.amount);
        setSelectedPack(newPack);
        setSelectedPackId(newPack.id);
      }
    } else {
      setCreditsToBuy(undefined);
      setSelectedPack(null);
      setSelectedPackId(null);
    }
  };

  useEffect(() => {
    (async () => {
      setPacks((await getCreditPackList()) ?? []);
    })();
  }, []);

  useEffect(() => {
    if (isProcessingTx) {
      const t = setTimeout(() => {
        setIsTimedOut(true);
        abortCreditPurchase();
        setIsLoading(false);
      }, 20000);

      setTimer(t);
    } else {
      if (timer !== null) {
        clearTimeout(timer);
        setTimer(null);
      }
    }

    return () => {
      if (timer !== null) {
        clearTimeout(timer);
        setTimer(null);
      }
    };
  }, [isProcessingTx]);

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
            if (isTimedOut) setIsTimedOut(false);
            onClose();
          }
        }}
      >
        <DrawerContent className="p-6 flex flex-col gap-2">
          <Dialog>
            <DialogTitle>
              <div className="flex justify-between items-center mb-2">
                <p className="text-base text-secondary font-bold">
                  Buy Credits
                </p>
                <div onClick={onClose}>
                  <CloseIcon width={16} height={16} />
                </div>
              </div>
            </DialogTitle>
          </Dialog>
          <div className="text-sm font-medium mb-2">
            <p>
              Select your desired amount of credits and tap on &quot;Buy
              Credits&quot; to purchase with SOL.
            </p>
          </div>
          {packs && packs.length > 0 && (
            <>
              <CreditPackList
                packs={packs}
                onSelect={handleSelectPack}
                selected={selectedPackId}
              />
              <div className="relative flex items-center py-2">
                <div className="border-gray-500 border-t w-full"></div>
                <span className="px-6 font-bold text-sm">Or</span>
                <div className="border-gray-500 border-b w-full h-1/2"></div>
              </div>
            </>
          )}
          <div className="grid grid-cols-[1fr_auto_auto] gap-2">
            <input
              id="creditsToBuy"
              type="text"
              inputMode="numeric"
              pattern="/^[0-9]*$/"
              step="1"
              min="1"
              max={MAX_CREDITS}
              required
              placeholder="0 Credits"
              className="block h-full w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
              value={selectedPackId === null ? creditsToBuy : ""}
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
              disabled={
                (!hasSufficientFunds && selectedPackId === null) ||
                isProcessingTx ||
                isLoading
              }
              onClick={() => incrementCreditsToBuy()}
            >
              +
            </Button>
          </div>
          <hr className="border-purple-500 my-2 p-0" />
          {isTimedOut && (
            <div className="text-red-500 border border-red-500 p-2 rounded-sm text-sm flex flex-col gap-2">
              <p>Timed out waiting for transaction confirmation.</p>

              {txHash && (
                <p>
                  You can check if it went through on-chain{" "}
                  <a
                    href={`https://solana.fm/tx/${txHash}`}
                    className="text-white underline"
                    target="_blank"
                  >
                    here
                  </a>{" "}
                  or try again.
                </p>
              )}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <span className="flex justify-between my-2 text-sm font-medium">
              <span>Subtotal</span>
              <span>
                {!hasSufficientFunds ? (
                  <span>Insufficient funds</span>
                ) : (
                  <>
                    {totalSolCost.toString()} SOL{" "}
                    {solPrice?.price !== undefined && (
                      <span className="text-gray-500">
                        (~$
                        {totalSolCost
                          .mul(solPrice?.price ?? 0)
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
                !hasSufficientFunds ||
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
