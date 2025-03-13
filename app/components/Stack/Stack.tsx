"use client";

import type { ExtendedStack } from "@/types/stack";
import Image from "next/image";
import Link from "next/link";
import type { GetPlaiceholderReturn } from "plaiceholder";

import TrophyOutlineIcon from "../Icons/TrophyOutlinedIcon";
import StackDeckCard from "../StackDeckCard/StackDeckCard";
import StacksHeader from "../StacksHeader/StacksHeader";

type StackProps = {
  stack: ExtendedStack;
  totalNumberOfCards: number;
  blurData: GetPlaiceholderReturn;
  userId: string | undefined;
};

export const Stack = ({
  stack,
  totalNumberOfCards,
  blurData,
  userId,
}: StackProps) => {
  return (
    <div className="flex flex-col gap-2 pt-4 overflow-hidden pb-2">
      <StacksHeader backAction="stacks" className="px-4" />
      <div className="p-4 bg-gray-850 flex gap-4">
        <div className="relative w-[100.5px] h-[100.5px]">
          <Image
            src={stack.image}
            blurDataURL={blurData?.base64}
            placeholder="blur"
            fill
            alt={stack.name}
            className="object-cover"
            sizes="(max-width: 600px) 80px, (min-width: 601px) 100.5px"
            onError={(e) => {
              e.currentTarget.src = "/images/chompy.png";
            }}
            priority
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-base mb-3">{stack.name}</h1>
          <p className="text-xs mb-6">
            {stack.deck.length} deck{stack.deck.length === 1 ? "" : "s"},{" "}
            {totalNumberOfCards} cards
          </p>
          <Link
            href={`/application/leaderboard/stack/${stack.id}`}
            className="mt-auto py-1 flex gap-1 items-center w-fit px-2 bg-gray-800 border border-gray-600 rounded-[56px]"
          >
            <p className="text-[12px] leading-[16px]">Leaderboards</p>
            <TrophyOutlineIcon />
          </Link>
        </div>
      </div>
      <div className="py-2 px-4 mb-2">
        <p className="text-sm">Decks</p>
      </div>
      <ul className="flex flex-col gap-2 px-4 overflow-auto">
        {stack.deck.map((deck) => {
          return (
            <StackDeckCard
              key={deck.id}
              deckId={deck.id}
              deckName={deck.deck}
              imageUrl={deck.imageUrl ? deck.imageUrl : stack.image}
              revealAtDate={deck.revealAtDate!}
              userId={userId}
              deckCreditCost={deck.totalCreditCost}
              deckRewardAmount={deck.totalRewardAmount}
              answeredQuestions={deck.answeredQuestions}
              totalQuestions={deck.totalQuestions}
            />
          );
        })}
      </ul>
    </div>
  );
};
