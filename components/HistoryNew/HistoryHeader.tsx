"use client";

import chompGraphicImage from "@/public/images/chomp-graphic.png";
import Image from "next/image";
import { useState } from "react";

import { QuestionCardIndicators } from "./QuestionCardIndicators";
import QuestionCardIndicatorsDrawer from "./QuestionCardIndicatorsDrawer";

type HistoryHeaderProps = {
  deckId: number;
  deckTitle: string;
  deckDescription: string | null;
  deckFooter: string | null;
  numberOfQuestions: number;
  deckImage?: string;
};

export function HistoryHeader({
  deckTitle,
  deckDescription,
  deckFooter,
  deckImage = chompGraphicImage.src,
}: HistoryHeaderProps) {
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState<boolean>(false);

  return (
    <div className="bg-gray-800 rounded-lg p-2 gap-2 flex flex-col">
      <div className="flex justify-between bg-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-5">
          <div className="flex items-center">
            <div className="relative w-[45.5px] h-[45.5px]">
              <Image
                src={deckImage}
                fill
                alt={deckTitle}
                className="object-fill"
                priority
              />
            </div>
          </div>
          <div className="text-lg font-medium">
            {deckTitle}

            {deckDescription && (
              <div className="text-xs mt-2">{deckDescription}</div>
            )}

            {deckFooter && <div className="text-xs mt-2">{deckFooter}</div>}
          </div>
        </div>
      </div>

      <QuestionCardIndicatorsDrawer
        isOpen={isInfoDrawerOpen}
        onClose={() => setIsInfoDrawerOpen(false)}
      />

      <QuestionCardIndicators
        correctCount={9}
        incorrectCount={9}
        unansweredCount={9}
        unrevealedCount={9}
        onInfoClick={() => setIsInfoDrawerOpen(true)}
      />
    </div>
  );
}
