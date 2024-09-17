"use client";

import { Button } from "@/app/components/Button/Button";
import { Deck, Question } from "@/app/components/Deck/Deck";
import PreviewDeckCard from "@/app/components/PreviewDeckCard";
import Stepper from "@/app/components/Stepper/Stepper";
import { MIX_PANEL_EVENTS, MIX_PANEL_METADATA } from "@/app/constants/mixpanel";
import sendToMixpanel from "@/lib/mixpanel";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";
import { UserData } from "../DailyDeckScreen/DailyDeckScreen";

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
  nextDeckId?: number;
  numberOfUserAnswers: number;
  userData: UserData;
};

const DeckScreen = ({
  deckInfo,
  questions,
  currentDeckId,
  nextDeckId,
  numberOfUserAnswers,
  userData,
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
                  [MIX_PANEL_METADATA.USERNAME]: userData.username,
                  [MIX_PANEL_METADATA.USER_WALLET_ADDRESS]: userData.address,
                  [MIX_PANEL_METADATA.USER_ID]: userData.id,
                });
                setIsDeckStarted(true);
              }}
            >
              Begin deck
            </Button>
            <Button
              className="h-50 w-full"
              onClick={() => router.push("/application")}
            >
              Back to homepage
            </Button>
          </div>
        </div>
      ) : (
        <Deck
          questions={questions}
          deckId={currentDeckId}
          nextDeckId={nextDeckId}
          deckVariant="regular-deck"
          userData={userData}
        />
      )}
    </>
  );
};

export default DeckScreen;
