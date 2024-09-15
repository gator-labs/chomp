"use client";

import ArrowRightCircleOuter from "../Icons/ArrowRightCircleOuter";
import Share from "../Icons/Share";
import { Button } from "../ui/button";
import { QUESTION_CARD_CONTENT } from "./constants";

import { useRouter } from "next-nprogress-bar";

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
      <div
        className="questions-card text-white  relative"
        style={{
          aspectRatio: 0.92,
          height: variant === "answer-page" ? "100%" : "auto",
        }}
      >
        <div className="flex items-center justify-start text-left flex-col h-full gap-5">
          <div className="text-2xl font-bold mb-2 w-full">
            {QUESTION_CARD_CONTENT[variant].title}
          </div>
          <div className="text-base relative z-10">
            {QUESTION_CARD_CONTENT[variant].body(deckRevealAtDate)}
          </div>
        </div>
        <div className="absolute bottom-2.5 right-4">
          {QUESTION_CARD_CONTENT[variant].backgroundIcon}
        </div>
      </div>
      <div className="py-4 flex flex-col gap-4">
        {nextDeckId ? (
          <Button
            className="gap-1 h-[50px]"
            onClick={() => {
              router.replace(`/application/decks/${nextDeckId}`);
              router.refresh();
            }}
          >
            Next Deck <ArrowRightCircleOuter />
          </Button>
        ) : (
          <Button
            className="gap-1 h-[50px]"
            onClick={() => {
              router.replace(`/application`);
              router.refresh();
            }}
          >
            Home <ArrowRightCircleOuter />
          </Button>
        )}
        <Button
          className="gap-1 h-[50px]"
          variant="outline"
          onClick={() => {
            // add logic
          }}
        >
          Share & Earn more! <Share />
        </Button>
      </div>
    </div>
  );
}
