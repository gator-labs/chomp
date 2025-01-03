import { Button } from "@/app/components/ui/button";
import { TRACKING_EVENTS, TRACKING_METADATA } from "@/app/constants/tracking";
import { getUserTotalCreditAmount } from "@/app/queries/home";
import trackEvent from "@/lib/trackEvent";
import { CircleArrowRight, Dice5Icon } from "lucide-react";
import { useRouter } from "next-nprogress-bar";
import { usePathname } from "next/navigation";
import { useState } from "react";

import BuyCreditsDrawer from "../BuyCreditsDrawer/BuyCreditsDrawer";

type DeckScreenActionProps = {
  currentDeckId: number;
  setIsDeckStarted: (isDeckStarted: boolean) => void;
  totalCredits: number;
  deckCost: number | null;
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

  const hasEnoughCredits = totalCredits >= (deckCost ?? 0);
  const creditsRequired = (deckCost ?? 0) - totalCredits;
  const isCurrentDeckFree = deckCost === 0;

  const onClose = () => {
    setIsOpen(false);
  };
  return (
    <div className="flex flex-col gap-4 py-4">
      <Button
        onClick={async () => {
          if (
            deckCost === null || // Start deck if no cost
            deckCost === 0 || // Start deck if free
            (deckCost > 0 && hasEnoughCredits) || // Start deck if cost and enough credits
            !CREDIT_COST_FEATURE_FLAG // Start deck if no cost feature flag
          ) {
            trackEvent(TRACKING_EVENTS.DECK_STARTED, {
              [TRACKING_METADATA.DECK_ID]: currentDeckId,
              [TRACKING_METADATA.IS_DAILY_DECK]: false,
            });

            const totalCredits = await getUserTotalCreditAmount();
            if (totalCredits >= (deckCost ?? 0)) {
              setIsDeckStarted(true);
            } else {
              router.refresh();
            }
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
      <BuyCreditsDrawer isOpen={isOpen} onClose={onClose} />
    </div>
  );
};

export default DeckScreenAction;
