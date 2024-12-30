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
  totalCredits: number;
  deckCost: number;
  freeExpiringDeckId: number | null;
};

const CREDIT_COST_FEATURE_FLAG =
  process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION === "true";

const DeckScreenAction = ({
  currentDeckId,
  setIsDeckStarted,
  totalCredits,
  deckCost,
  freeExpiringDeckId,
}: DeckScreenActionProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const hasEnoughCredits = totalCredits >= deckCost;
  const creditsRequired = deckCost - totalCredits;
  const isCurrentDeckFree = deckCost === 0;

  const onClose = () => {
    setIsOpen(false);
  };
  return (
    <div className="flex flex-col gap-4 py-4">
      <Button
        onClick={() => {
          if (hasEnoughCredits || !CREDIT_COST_FEATURE_FLAG) {
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
        {CREDIT_COST_FEATURE_FLAG && !hasEnoughCredits
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
            !isCurrentDeckFree
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
        !isCurrentDeckFree ? (
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
