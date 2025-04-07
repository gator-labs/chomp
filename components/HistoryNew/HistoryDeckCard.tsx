"use client";

import { ArrowRightCircle } from "@/app/components/Icons/ArrowRightCircle";
import TrophyStarMarkIcon from "@/app/components/Icons/TrophyStarMarkIcon";
import { formatCompactAmount } from "@/app/utils/number";
import { getDeckPath } from "@/lib/urls";
import { DeckHistoryItem } from "@/types/history";
import { TrophyIcon } from "lucide-react";

import DeckWrapper from "../Deck/DeckWrapper";

interface HistoryDeckCardProps {
  deck: DeckHistoryItem;
}

export const HistoryDeckCard = ({ deck }: HistoryDeckCardProps) => {
  const {
    id,
    deck: deckName,
    imageUrl,
    revealAtDate,
    total_reward_amount,
    total_credit_cost,
    answeredQuestions,
    totalQuestions,
  } = deck;

  const currentDate = new Date();
  const isDeckRevealed = currentDate > revealAtDate;

  const linkPath = getDeckPath(id);

  const progressPercentage =
    totalQuestions && answeredQuestions
      ? (answeredQuestions / totalQuestions) * 100
      : 0;

  return (
    <DeckWrapper
      linkPath={linkPath}
      wrapperType="a"
      answeredQuestions={answeredQuestions}
      progressPercentage={progressPercentage}
      imageUrl={imageUrl}
      deckTitle={deckName}
      totalQuestions={totalQuestions}
    >
      <div className="flex items-center justify-between">
        {total_credit_cost === 0 ? (
          <div className="flex bg-[#6C633A] justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-white">
            <TrophyIcon width={16} height={16} />
            <b>No Rewards</b>
          </div>
        ) : isDeckRevealed ? (
          <div className="flex bg-[#426D64] justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-white">
            <TrophyStarMarkIcon width={16} height={16} />
            <b>{formatCompactAmount(total_reward_amount ?? 0)} BONK</b>
            <b className="text-white/50">Rewarded</b>
          </div>
        ) : (
          <div className="flex bg-[#6C633A] justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-white">
            <TrophyIcon width={16} height={16} />
            <b>0 BONK</b>
          </div>
        )}
        <div className="bg-gray-800 p-3 leading-6 rounded-full">
          <div className="flex items-center justify-center gap-1 text-xs">
            <p>Results</p>
            <ArrowRightCircle width={18} height={18} fill="#AFADEB" />
          </div>
        </div>
      </div>
    </DeckWrapper>
  );
};
