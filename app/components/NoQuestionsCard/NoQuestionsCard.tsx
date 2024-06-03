"use client";

import { useRouter } from "next/navigation";
import { Button } from "../Button/Button";
import { TrophyGraphic } from "../Graphics/TrophyGraphic";
import { HalfArrowRightIcon } from "../Icons/HalfArrowRightIcon";
import { QUESTION_CARD_CONTENT } from "./constants";

type NoQuestionsCardProps = {
  variant: "daily-deck" | "regular-deck" | "answer-page";
  browseHomeUrl?: string;
};

export function NoQuestionsCard({
  browseHomeUrl,
  variant,
}: NoQuestionsCardProps) {
  const hasBrowseHome = !!browseHomeUrl;

  const router = useRouter();

  return (
    <div className="flex flex-col justify-between h-full w-full">
      <div
        className="questions-card text-white font-sora relative"
        style={{
          aspectRatio: 0.92,
        }}
      >
        <div>
          <div className="text-2xl font-bold mb-2">
            {QUESTION_CARD_CONTENT[variant].title}
          </div>
          <div className="text-sm max-w-72 relative z-10">
            {QUESTION_CARD_CONTENT[variant].body}
          </div>
        </div>
        <TrophyGraphic className="absolute bottom-2.5 right-4" />
      </div>
      {hasBrowseHome && (
        <Button
          variant="pink"
          size="big"
          className="gap-1 my-[53px]"
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
