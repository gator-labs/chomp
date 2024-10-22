"use client";

import gatorHeadImage from "@/public/images/gator-head.png";
import { CircleArrowRight } from "lucide-react";
import { useRouter } from "next-nprogress-bar";
import Image from "next/image";

import { Button } from "../ui/button";
import { QUESTION_CARD_CONTENT } from "./constants";
import QuestionCardLayout from "../QuestionCardLayout/QuestionCardLayout";

type NoQuestionsCardProps = {
  variant:
    | "daily-deck"
    | "regular-deck"
    | "answer-page"
    | "answered-none"
    | "answered-some";
  nextDeckId?: number;
  deckRevealAtDate?: Date | null;
};

export function NoQuestionsCard({
  variant,
  nextDeckId,
  deckRevealAtDate,
}: NoQuestionsCardProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-between h-full w-full gap-4">
      <QuestionCardLayout>
        <div className="flex items-center justify-start text-left flex-col space-y-5">
          <div className="text-[24px] font-bold w-full text-purple-200">
            {QUESTION_CARD_CONTENT[variant].title}
          </div>
          <div className="text-[14px] relative z-10">
            {QUESTION_CARD_CONTENT[variant].body(deckRevealAtDate)}
          </div>
        </div>
      </QuestionCardLayout>
      {nextDeckId ? (
        <Button
          className="text-[14px] gap-2"
          onClick={() => {
            router.replace(`/application/decks/${nextDeckId}`);
            router.refresh();
          }}
        >
          Next Deck <CircleArrowRight />
        </Button>
      ) : (
        <Button
          className="text-[14px] gap-2"
          onClick={() => {
            router.replace("/application");
            router.refresh();
          }}
        >
          Go Home <CircleArrowRight />
        </Button>
      )}
    </div>
  );
}
