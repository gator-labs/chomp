"use client";

import type { Question } from "@/app/components/Deck/Deck";
import { getUserTotalCreditAmount } from "@/app/queries/home";
import { useState } from "react";

import DeckScreen from "./DeckScreen";

type ClientDeckWrapperProps = {
  initialCredits: number;
  currentDeckId: number;
  nextDeckId?: number;
  questions: Question[];
  stackImage: string;
  deckInfo: {
    heading: string;
    description: string | null;
    footer: string | null;
    imageUrl: string | null;
    totalNumberOfQuestions: number;
    revealAtDate?: Date | null;
  };
  numberOfUserAnswers: number;
  deckCost: number | null;
  freeExpiringDeckId: number | null;
};

export default function ClientDeckWrapper({
  initialCredits,
  currentDeckId,
  nextDeckId,
  questions,
  stackImage,
  deckInfo,
  numberOfUserAnswers,
  deckCost,
  freeExpiringDeckId,
}: ClientDeckWrapperProps) {
  const [credits, setCredits] = useState(initialCredits);

  const handleUpdateCredits = async () => {
    const newCredits = await getUserTotalCreditAmount();
    setCredits(newCredits);
  };

  return (
    <DeckScreen
      currentDeckId={currentDeckId}
      nextDeckId={nextDeckId}
      questions={questions}
      stackImage={stackImage}
      deckInfo={deckInfo}
      numberOfUserAnswers={numberOfUserAnswers}
      credits={credits}
      deckCost={deckCost}
      freeExpiringDeckId={freeExpiringDeckId}
      onUpdateCredits={handleUpdateCredits}
    />
  );
}
