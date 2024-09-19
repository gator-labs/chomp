"use client";

import { Button } from "../ui/button";
import { QUESTION_CARD_CONTENT } from "./constants";
import { useRouter } from "next-nprogress-bar";
import { Share2, CircleArrowRight } from 'lucide-react';
import Image from "next/image";
import gatorHeadImage from "@/public/images/gator-head.png";

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
    <div className="flex flex-col justify-between h-full w-full gap-[16px]">
      <div
        className="questions-card text-white  relative mb-[4px]"
      >
        <div className="flex items-center justify-start text-left flex-col gap-[20px]">
          <div className="text-[24px] font-bold mb-2 w-full text-[#AFADEB]">
            {QUESTION_CARD_CONTENT[variant].title}
          </div>
          <div className="text-[14px] relative z-10">
            {QUESTION_CARD_CONTENT[variant].body(deckRevealAtDate)}
          </div>
        </div>
        <Image
          src={gatorHeadImage}
          alt="gator-head"
          className="absolute bottom-0 left-0 w-full"
          style={{ zIndex: 1 }}
        />
      </div>
      <Button
        onClick={() => window.open(process.env.NEXT_PUBLIC_REWARD_TASKON_URL, '_blank')}
        className="text-[14px] gap-2"
      >
        Share & Earn More
        <Share2 />
      </Button>
      {
        nextDeckId ? (
          <Button
            variant="outline"
            className="text-[14px] gap-[16px]"
            onClick={() => {
              router.replace(`/application/decks/${nextDeckId}`);
              router.refresh();

            }}
          >
            Next Deck <CircleArrowRight />
          </Button>
        ) : (
          <Button
            variant="outline"
            className="text-[14px] gap-[16px]"
            onClick={() => {
              router.replace("/application");
              router.refresh();
            }}
          >
            Go Home   <CircleArrowRight />
          </Button>
        )
      }
    </div >
  );
}