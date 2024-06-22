// NoQuestionsCard Component
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
    | "missed-all"
    | "missed-some";
  browseHomeUrl?: string;
};

export function NoQuestionsCard({
  browseHomeUrl,
  variant,
}: NoQuestionsCardProps) {
  const hasBrowseHome = !!browseHomeUrl;

  const router = useRouter();

  return (
    <div className="flex flex-col justify-start gap-5 h-full w-full">
      <div
        className="questions-card text-white font-sora relative"
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
            {QUESTION_CARD_CONTENT[variant].body}
          </div>
        </div>
        <div className="absolute bottom-2.5 right-4">
          {QUESTION_CARD_CONTENT[variant].icon}
        </div>
      </div>
      {hasBrowseHome && (
        <Button
          variant="pink"
          size="big"
          className="gap-1"
          onClick={() => {
            router.replace(browseHomeUrl);
            router.refresh();
          }}
        >
          Home <HalfArrowRightIcon fill="#0D0D0D" />
        </Button>
      )}
    </div>
  );
}
