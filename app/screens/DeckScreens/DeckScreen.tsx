"use client";

import { Deck, Question } from "@/app/components/Deck/Deck";
import PreviewDeckCard from "@/app/components/PreviewDeckCard";
import Stepper from "@/app/components/Stepper/Stepper";
import { Button } from "@/app/components/ui/button";
import { TRACKING_EVENTS, TRACKING_METADATA } from "@/app/constants/tracking";
import trackEvent from "@/lib/trackEvent";
import { CircleArrowRight } from "lucide-react";
import { useRouter } from "next-nprogress-bar";
import { usePathname } from "next/navigation";
import { useState } from "react";

type DeckScreenProps = {
  deckInfo: {
    heading: string;
    description: string | null;
    footer: string | null;
    imageUrl: string | null;
    totalNumberOfQuestions: number;
    revealAtDate?: Date | null;
  };
  questions: Question[];
  currentDeckId: number;
  stackImage: string;
  nextDeckId?: number;
  numberOfUserAnswers: number;
  totalCredits: number;
  deckCost: number | null;
};

const DeckScreen = ({
  deckInfo,
  questions,
  currentDeckId,
  nextDeckId,
  stackImage,
  numberOfUserAnswers,
  totalCredits,
  deckCost,
}: DeckScreenProps) => {
  const hasDeckInfo =
    !!deckInfo?.description || !!deckInfo?.footer || !!deckInfo?.imageUrl;

  const [isDeckStarted, setIsDeckStarted] = useState(
    numberOfUserAnswers > 0 || !hasDeckInfo,
  );
  const router = useRouter();
  const pathname = usePathname();

  const CREDIT_COST_FEATURE_FLAG =
    process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION === "true";

  return (
    <>
      {!isDeckStarted ? (
        <div className="flex flex-col gap-4 h-full w-full">
          {CREDIT_COST_FEATURE_FLAG && (
            <div className="rounded-[56px] bg-chomp-blue-light text-xs text-gray-900 p-2 w-fit font-medium">
              {totalCredits > (deckCost ?? 0) ? (
                <span className="opacity-50">Balance </span>
              ) : (
                <span className="opacity-50 text-chomp-red-dark">
                  Balance Low{" "}
                </span>
              )}
              {totalCredits} {totalCredits === 1 ? "Credit" : "Credits"}
            </div>
          )}
          <Stepper
            numberOfSteps={questions.length}
            activeStep={-1}
            color="green"
            className="pt-0 px-0"
          />
          {hasDeckInfo && (
            <PreviewDeckCard
              {...deckInfo}
              stackImage={stackImage}
              totalNumberOfQuestions={questions.length}
            />
          )}
          <div className="flex flex-col gap-4 py-4">
            <Button
              onClick={() => {
                trackEvent(TRACKING_EVENTS.DECK_STARTED, {
                  [TRACKING_METADATA.DECK_ID]: currentDeckId,
                  [TRACKING_METADATA.IS_DAILY_DECK]: false,
                });
                setIsDeckStarted(true);
              }}
            >
              Begin Deck
              <CircleArrowRight />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (pathname.endsWith("answer"))
                  return router.replace("/application");

                router.back();
              }}
            >
              {pathname.endsWith("answer") ? "Home" : "Back"}
            </Button>
          </div>
        </div>
      ) : (
        <Deck
          questions={questions}
          deckId={currentDeckId}
          nextDeckId={nextDeckId}
          deckVariant="regular-deck"
        />
      )}
    </>
  );
};

export default DeckScreen;
