"use client";
import { Button } from "@/app/components/ui/button";
import { Deck, Question } from "@/app/components/Deck/Deck";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";
import { CircleArrowRight } from 'lucide-react';
import PreviewDeckCard from "@/app/components/PreviewDeckCard";
import Stepper from "@/app/components/Stepper/Stepper";
import { MIX_PANEL_EVENTS, MIX_PANEL_METADATA } from "@/app/constants/mixpanel";
import sendToMixpanel from "@/lib/mixpanel";

type DeckScreenProps = {
  deckInfo: {
    heading: string;
    description: string | null;
    footer: string | null;
    imageUrl: string | null;
    totalNumberOfQuestions: number;
  };
  questions: Question[];
  currentDeckId: number;
  campaignImage: string;
  nextDeckId?: number;
  numberOfUserAnswers: number;
};

const DeckScreen = ({
  deckInfo,
  questions,
  currentDeckId,
  nextDeckId,
  campaignImage,
  numberOfUserAnswers,
}: DeckScreenProps) => {
  const [isDeckStarted, setIsDeckStarted] = useState(numberOfUserAnswers > 0);
  const router = useRouter();

  return (
    <>
      {!isDeckStarted ? (
        <div className="flex flex-col gap-4 h-full">
          <Stepper
            numberOfSteps={questions.length}
            activeStep={-1}
            color="green"
            className="pt-0 px-0"
          />
          <PreviewDeckCard
            {...deckInfo}
            campaignImage={campaignImage}
            totalNumberOfQuestions={questions.length}
            className="flex-1"
          />
          <div className="flex flex-col gap-4 py-4">
            <Button
              variant="primary"
              className="h-50 w-full"
              onClick={() => {
                sendToMixpanel(MIX_PANEL_EVENTS.DECK_STARTED, {
                  [MIX_PANEL_METADATA.DECK_ID]: currentDeckId,
                  [MIX_PANEL_METADATA.IS_DAILY_DECK]: false,
                });
                setIsDeckStarted(true);
              }}
            >
              Begin deck
              <CircleArrowRight />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Back
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