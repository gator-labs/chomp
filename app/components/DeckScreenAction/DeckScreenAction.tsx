import { Button } from "@/app/components/ui/button";
import { TRACKING_EVENTS, TRACKING_METADATA } from "@/app/constants/tracking";
import trackEvent from "@/lib/trackEvent";
import { CloseIcon } from "@dynamic-labs/sdk-react-core";
import { DialogTitle } from "@radix-ui/react-dialog";
import { CircleArrowRight, Dice5Icon } from "lucide-react";
import { useRouter } from "next-nprogress-bar";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Drawer, DrawerContent } from "../ui/drawer";

type DeckScreenActionProps = {
  currentDeckId: number;
  setIsDeckStarted: (isDeckStarted: boolean) => void;
  credits: number;
  deckCost: number | null;
  freeExpiringDeckId: number | null;
  onUpdateCredits: () => Promise<void>;
};

const CREDIT_COST_FEATURE_FLAG =
  process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION === "true";

const DeckScreenAction = ({
  currentDeckId,
  setIsDeckStarted,
  credits,
  deckCost,
  freeExpiringDeckId,
  onUpdateCredits,
}: DeckScreenActionProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const hasEnoughCredits = credits >= (deckCost ?? 0);
  const creditsRequired = (deckCost ?? 0) - credits;
  const isCurrentDeckFree = deckCost === 0;

  const onClose = () => {
    setIsOpen(false);
  };
  return (
    <div className="flex flex-col gap-4 py-4">
      <Button
        onClick={async () => {
          // Update credits before checking balance
          await onUpdateCredits();

          // The credits prop will be updated by the parent after onUpdateCredits
          if (
            deckCost === null || // Start deck if no cost
            deckCost === 0 || // Start deck if free
            (deckCost > 0 && credits >= (deckCost ?? 0)) || // Start deck if cost and enough credits
            !CREDIT_COST_FEATURE_FLAG // Start deck if no cost feature flag
          ) {
            trackEvent(TRACKING_EVENTS.DECK_STARTED, {
              [TRACKING_METADATA.DECK_ID]: currentDeckId,
              [TRACKING_METADATA.IS_DAILY_DECK]: false,
            });
            setIsDeckStarted(true);
          } else {
            setIsOpen(true);
          }
        }}
      >
        {CREDIT_COST_FEATURE_FLAG && !hasEnoughCredits && deckCost !== null
          ? `Buy ${creditsRequired} Credits`
          : "Begin Deck"}
        <CircleArrowRight />
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          if (
            CREDIT_COST_FEATURE_FLAG &&
            freeExpiringDeckId &&
            !isCurrentDeckFree &&
            deckCost !== null
          ) {
            router.replace(`/application/decks/${freeExpiringDeckId}`);
            router.refresh();
          } else {
            if (pathname.endsWith("answer"))
              return router.replace("/application");

            router.back();
          }
        }}
      >
        {CREDIT_COST_FEATURE_FLAG &&
        freeExpiringDeckId &&
        !isCurrentDeckFree &&
        deckCost !== null ? (
          <span className="flex items-center gap-2">
            Random Free Deck <Dice5Icon />
          </span>
        ) : pathname.endsWith("answer") ? (
          "Home"
        ) : (
          "Back"
        )}
      </Button>
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
                Buy {creditsRequired} More Credits?
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
            10 Credits ~ 0.02 SOL
          </span>
          <Button>Buy Credits</Button>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default DeckScreenAction;
