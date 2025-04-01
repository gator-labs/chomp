"use client";

import { DeckGraphic } from "@/app/components/Graphics/DeckGraphic";
import { ArrowRightCircle } from "@/app/components/Icons/ArrowRightCircle";
import CardsIcon from "@/app/components/Icons/CardsIcon";
import TrophyStarMarkIcon from "@/app/components/Icons/TrophyStarMarkIcon";
import { formatCompactAmount } from "@/app/utils/number";
import { getDeckPath } from "@/lib/urls";
import { DeckHistoryItem } from "@/types/history";
import { TrophyIcon } from "lucide-react";
import Image from "next/image";

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
  } = deck;

  const currentDate = new Date();
  const isDeckRevealed = currentDate > revealAtDate;

  const linkPath = getDeckPath(id);

  return (
    <a
      href={linkPath}
      className="bg-gray-700 rounded-2xl p-2 flex flex-col gap-2 h-full cursor-pointer"
    >
      <div className="flex bg-gray-800 p-2 rounded-2xl gap-2 items-center">
        <div className="w-[59px] h-[60px] bg-purple-500 rounded-xl flex-shrink-0 relative p-1">
          {imageUrl ? (
            <>
              <CardsIcon className="absolute top-0 left-0 w-full h-full" />
              <Image
                src={imageUrl}
                alt="logo"
                width={36}
                height={36}
                className="z-10 absolute w-8 h-8 rounded-full top-1/2 left-1/2 translate-x-[-50%] -translate-y-1/2 object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/chompy.png";
                }}
              />
            </>
          ) : (
            <DeckGraphic className="w-full h-full" />
          )}
        </div>
        <div className="text-white font-semibold text-base line-clamp-2 z-10">
          {deckName}
        </div>
      </div>
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
    </a>
  );
};
