"use client";

import { ArrowRightCircle } from "@/app/components/Icons/ArrowRightCircle";
import TrophyStarMarkIcon from "@/app/components/Icons/TrophyStarMarkIcon";
import { getTimeUntilReveal } from "@/app/utils/history";
import { formatCompactAmount } from "@/app/utils/number";
import { getDeckPath } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { DeckHistoryItem } from "@/types/history";
import { Clock3Icon, TrophyIcon } from "lucide-react";

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
  const isPracticeQuestion = total_credit_cost === 0;

  const linkPath = getDeckPath(id);

  const progressPercentage =
    totalQuestions && answeredQuestions
      ? (answeredQuestions / totalQuestions) * 100
      : 0;

  return (
    <DeckWrapper
      linkPath={linkPath}
      wrapperType={isDeckRevealed ? "a" : "div"}
      answeredQuestions={answeredQuestions}
      progressPercentage={progressPercentage}
      imageUrl={imageUrl}
      deckTitle={deckName}
      totalQuestions={totalQuestions}
    >
      <div className="flex items-center justify-between">
        {isDeckRevealed ? (
          <div
            className={cn(
              "flex bg-chomp-green-muted justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-white",
              { "bg-chomp-yellow-brown": isPracticeQuestion },
            )}
          >
            {isPracticeQuestion ? (
              <TrophyIcon width={16} height={16} />
            ) : (
              <TrophyStarMarkIcon width={16} height={16} />
            )}
            {isPracticeQuestion ? (
              <b>No Rewards</b>
            ) : (
              <>
                <b>{formatCompactAmount(total_reward_amount ?? 0)} BONK</b>
                <b className="text-white/50">Rewarded</b>
              </>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "flex bg-chomp-blue-light justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-black",
              {
                "bg-chomp-gold-light": isPracticeQuestion,
              },
            )}
          >
            <Clock3Icon width={16} height={16} />
            <b>Reveals in {getTimeUntilReveal(revealAtDate, true)}</b>
          </div>
        )}
        <div className="bg-gray-800 p-3 leading-6 rounded-full">
          <div className="flex items-center justify-center gap-1 text-xs">
            <p className={cn({ "text-gray-600": !isDeckRevealed })}>Results</p>

            <ArrowRightCircle
              width={18}
              height={18}
              fill={isDeckRevealed ? "#AFADEB" : "#4D4D4D"}
            />
          </div>
        </div>
      </div>
    </DeckWrapper>
  );
};
