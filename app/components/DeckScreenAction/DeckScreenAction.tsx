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
  deckCreditCost: number | null;
  freeExpiringDeckId: number | null;
  creditCostFeatureFlag: boolean;
};

const DeckScreenAction = ({
  currentDeckId,
  setIsDeckStarted,
  totalCredits,
  deckCreditCost,
  freeExpiringDeckId,
  creditCostFeatureFlag,
}: DeckScreenActionProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const hasEnoughCredits = deckCreditCost
    ? totalCredits >= deckCreditCost
    : false;
  const creditsRequired = deckCreditCost ? deckCreditCost - totalCredits : 0;
  const isCurrentDeckFree = deckCreditCost === 0;

  const onClose = () => {
    setIsOpen(false);
  };
  return (
    <div className="flex flex-col gap-4 py-4">
      <Button
        onClick={async () => {
          /**
           * Handle paid decks:
           * - Check if the user has sufficient credits to start the deck.
           * - Open the "Buy Credits" drawer if the user's balance is insufficient.
           */
          if (
            creditCostFeatureFlag &&
            deckCreditCost !== null &&
            deckCreditCost > 0
          ) {
            // Open "Buy Credits" drawer if the user doesn't have enough credits.
            if (!hasEnoughCredits) {
              setIsOpen(true);
              return;
            }

            /**
             * Fetch the latest credit balance:
             * - If the balance meets or exceeds the cost, start the deck and track the event.
             * - If the balance is still insufficient, refresh the page.
             */
            const totalCredits = await getUserTotalCreditAmount();
            if (totalCredits >= deckCreditCost) {
              trackEvent(TRACKING_EVENTS.DECK_STARTED, {
                [TRACKING_METADATA.DECK_ID]: currentDeckId,
                [TRACKING_METADATA.IS_DAILY_DECK]: false,
              });
              setIsDeckStarted(true);
            } else {
              router.refresh();
            }
          } else if (
            /**
             * Handle free decks:
             * - If the deck is free (cost is null or 0) or the credit feature flag is disabled,
             *   start the deck and track the event directly.
             */
            deckCreditCost === null ||
            deckCreditCost === 0 ||
            !creditCostFeatureFlag
          ) {
            trackEvent(TRACKING_EVENTS.DECK_STARTED, {
              [TRACKING_METADATA.DECK_ID]: currentDeckId,
              [TRACKING_METADATA.IS_DAILY_DECK]: false,
            });
            setIsDeckStarted(true);
          }
        }}
      >
        {creditCostFeatureFlag &&
        !hasEnoughCredits &&
        deckCreditCost !== null &&
        deckCreditCost > 0
          ? `Buy ${creditsRequired} Credits`
          : "Begin Deck"}
        <CircleArrowRight />
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          if (
            creditCostFeatureFlag &&
            freeExpiringDeckId &&
            !isCurrentDeckFree &&
            deckCreditCost !== null
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
        {creditCostFeatureFlag &&
        freeExpiringDeckId &&
        !isCurrentDeckFree &&
        deckCreditCost !== null ? (
          <span className="flex items-center gap-2">
            Random Free Deck <Dice5Icon />
          </span>
        ) : pathname.endsWith("answer") ? (
          "Home"
        ) : (
          "Back"
        )}
      </Button>
      <BuyCreditsDrawer
        isOpen={isOpen}
        onClose={onClose}
        creditsToBuy={creditsRequired}
      />
    </div>
  );
};

export default DeckScreenAction;
