"use client";
import { Button } from "@/app/components/ui/button";
import { Deck, Question } from "@/app/components/Deck/Deck";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";
import { CircleArrowRight } from 'lucide-react';
import PreviewDeckCard from "@/app/components/PreviewDeckCard";
import Stepper from "@/app/components/Stepper/Stepper";

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
};

const DeckScreen = ({
  deckInfo,
  questions,
  currentDeckId,
  nextDeckId,
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
            totalNumberOfQuestions={questions.length}
            className="flex-1"
          />
          <div className="flex flex-col gap-4 py-4">
            <Button
              onClick={() => setIsDeckStarted(true)}
              className="text-[14px] gap-2"
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