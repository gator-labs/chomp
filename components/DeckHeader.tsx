import chompGraphicImage from "@/public/images/chomp-graphic.png";
import Image from "next/image";

import { QuestionCardIndicators } from "./QuestionCardIndicators";

type DeckHeaderProps = {
  deckId: number;
  deckTitle: string;
  deckDescription: string | null;
  deckFooter: string | null;
  numberOfQuestions: number;
  deckImage?: string;
};

export function DeckHeader({
  deckId,
  deckTitle,
  deckDescription,
  deckFooter,
  numberOfQuestions,
  deckImage = chompGraphicImage.src,
}: DeckHeaderProps) {
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
          </div>
        </div>
      </div>

      <QuestionCardIndicators
        correctCount={4}
        incorrectCount={1}
        unansweredCount={4}
        unrevealedCount={3}
      />
    </div>
  );
}
