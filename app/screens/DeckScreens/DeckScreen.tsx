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
  totalCredits: number;
  deckCreditCost: number | null;
  freeExpiringDeckId: number | null;
  blurData: string | undefined;
};

const DeckScreen = ({
  deckInfo,
  questions,
  currentDeckId,
  nextDeckId,
  stackImage,
  numberOfUserAnswers,
  totalCredits,
  deckCreditCost,
  freeExpiringDeckId,
  blurData,
}: DeckScreenProps) => {
  const hasDeckInfo =
    !!deckInfo?.description || !!deckInfo?.footer || !!deckInfo?.imageUrl;

  const CREDIT_COST_FEATURE_FLAG =
    process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION === "true";

  // If no preview deck info and not a premium deck start the deck immediately
  const [isDeckStarted, setIsDeckStarted] = useState(
    deckCreditCost === null && (numberOfUserAnswers > 0 || !hasDeckInfo),
  );

  return (
    <>
      {!isDeckStarted ? (
        <div className="flex flex-col gap-4 h-full w-full">
          {CREDIT_COST_FEATURE_FLAG && deckCreditCost !== null ? (
            <div className="rounded-[56px] bg-chomp-blue-light text-xs text-gray-900 font-medium px-2 py-1 w-fit">
              {totalCredits >= deckCreditCost ? (
                <span className="opacity-50">Balance </span>
              ) : (
                <span className="opacity-60 text-chomp-red-dark">
                  Balance Low{" "}
                </span>
              )}
              {totalCredits} {totalCredits === 1 ? "Credit" : "Credits"}
            </div>
          ) : null}
          <Stepper
            numberOfSteps={questions.length}
            activeStep={-1}
            color="green"
            className="pt-0 px-0"
          />
          <PreviewDeckCard
            {...deckInfo}
            stackImage={stackImage}
            totalNumberOfQuestions={questions.length}
            deckCreditCost={deckCreditCost}
            blurData={blurData}
          />
          <DeckScreenAction
            currentDeckId={currentDeckId}
            setIsDeckStarted={setIsDeckStarted}
            totalCredits={totalCredits}
            deckCreditCost={deckCreditCost}
            freeExpiringDeckId={freeExpiringDeckId}
            creditCostFeatureFlag={CREDIT_COST_FEATURE_FLAG}
          />
        </div>
      ) : (
        <Deck
          questions={questions}
          deckId={currentDeckId}
          nextDeckId={nextDeckId}
          deckVariant="regular-deck"
          deckCost={deckCreditCost}
          totalCredits={totalCredits}
          creditCostFeatureFlag={CREDIT_COST_FEATURE_FLAG}
        />
      )}
    </>
  );
};

export default DeckScreen;
