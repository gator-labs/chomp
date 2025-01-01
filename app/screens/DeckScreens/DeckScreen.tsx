"use client";

import { Deck, Question } from "@/app/components/Deck/Deck";
import DeckScreenAction from "@/app/components/DeckScreenAction/DeckScreenAction";
import PreviewDeckCard from "@/app/components/PreviewDeckCard";
import Stepper from "@/app/components/Stepper/Stepper";
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
  credits: number;
  deckCost: number | null;
  freeExpiringDeckId: number | null;
  onUpdateCredits: () => Promise<void>;
};

const DeckScreen = ({
  deckInfo,
  questions,
  currentDeckId,
  nextDeckId,
  stackImage,
  numberOfUserAnswers,
  credits,
  deckCost,
  freeExpiringDeckId,
  onUpdateCredits,
}: DeckScreenProps) => {
  const hasDeckInfo =
    !!deckInfo?.description || !!deckInfo?.footer || !!deckInfo?.imageUrl;

  const [isDeckStarted, setIsDeckStarted] = useState(
    numberOfUserAnswers > 0 || !hasDeckInfo,
  );

  const CREDIT_COST_FEATURE_FLAG =
    process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION === "true";

  return (
    <>
      {!isDeckStarted ? (
        <div className="flex flex-col gap-4 h-full w-full">
          {CREDIT_COST_FEATURE_FLAG && deckCost !== null ? (
            <div className="rounded-[56px] bg-chomp-blue-light text-xs text-gray-900 font-medium px-2 py-1 w-fit">
              {credits > deckCost ? (
                <span className="opacity-50">Balance </span>
              ) : (
                <span className="opacity-60 text-chomp-red-dark">
                  Balance Low{" "}
                </span>
              )}
              {credits} {credits === 1 ? "Credit" : "Credits"}
            </div>
          ) : null}
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
              deckCost={deckCost}
            />
          )}
          <DeckScreenAction
            currentDeckId={currentDeckId}
            setIsDeckStarted={setIsDeckStarted}
            credits={credits}
            deckCost={deckCost}
            freeExpiringDeckId={freeExpiringDeckId}
            onUpdateCredits={onUpdateCredits}
          />
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
