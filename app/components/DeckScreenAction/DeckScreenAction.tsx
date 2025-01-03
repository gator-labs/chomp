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
  CREDIT_COST_FEATURE_FLAG: boolean;
};

const DeckScreenAction = ({
  currentDeckId,
  setIsDeckStarted,
  totalCredits,
  deckCost,
  freeExpiringDeckId,
  CREDIT_COST_FEATURE_FLAG,
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
          // If it is a paid deck, check if the user has enough credits to start the deck
          if (CREDIT_COST_FEATURE_FLAG && deckCost !== null && deckCost > 0) {
            const totalCredits = await getUserTotalCreditAmount();
            if (totalCredits >= (deckCost ?? 0)) {
              trackEvent(TRACKING_EVENTS.DECK_STARTED, {
                [TRACKING_METADATA.DECK_ID]: currentDeckId,
                [TRACKING_METADATA.IS_DAILY_DECK]: false,
              });
              setIsDeckStarted(true);
            } else {
              router.refresh();
            }
          }
          // If it is a free deck, start the deck
          else if (
            deckCost === null ||
            deckCost === 0 ||
            !CREDIT_COST_FEATURE_FLAG
          ) {
            trackEvent(TRACKING_EVENTS.DECK_STARTED, {
              [TRACKING_METADATA.DECK_ID]: currentDeckId,
              [TRACKING_METADATA.IS_DAILY_DECK]: false,
            });
            setIsDeckStarted(true);
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
