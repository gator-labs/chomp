"use client";

import { Button } from "../Button/Button";
import { HalfArrowRightIcon } from "../Icons/HalfArrowRightIcon";
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
    <div className="flex flex-col justify-between h-full w-full">
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
      {nextDeckId ? (
        <Button
          variant="pink"
          size="big"
          className="gap-1"
          onClick={() => {
            router.replace(`/application/decks/${nextDeckId}`);
            router.refresh();
          }}
        >
          Next Deck <HalfArrowRightIcon fill="#0D0D0D" />
        </Button>
      ) : (
        <Button
          variant="pink"
          size="big"
          className="gap-1"
          onClick={() => {
            router.replace("/application");
            router.refresh();
          }}
        >
          Home <HalfArrowRightIcon fill="#0D0D0D" />
        </Button>
      )}
    </div>
  );
}
