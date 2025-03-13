"use client";

import { getTimeUntilReveal } from "@/app/utils/history";
import { formatNumber } from "@/app/utils/number";
import { getDeckPath } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { Clock3Icon, TrophyIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { DeckGraphic } from "../Graphics/DeckGraphic";
import { ArrowRightCircle } from "../Icons/ArrowRightCircle";
import CardsIcon from "../Icons/CardsIcon";
import { CoinsIcon } from "../Icons/CoinsIcon";
import TrophyQuestionMarkIcon from "../Icons/TrophyQuestionMarkIcon";
import TrophyStarMarkIcon from "../Icons/TrophyStarMarkIcon";
import LoginPopUp from "../LoginPopUp/LoginPopUp";

type StackDeckCardProps = {
  deckId: number;
  deckName: string;
  imageUrl: string;
  revealAtDate: Date;
  userId?: string;
  deckCreditCost?: number;
  deckRewardAmount?: number;
  answeredQuestions: number;
  totalQuestions: number;
};

const getButtonText = (
  revealAtDate: Date,
  answeredQuestions: number,
  totalQuestions: number,
) => {
  const currentDate = new Date();
  const isDeckReadyToReveal = currentDate > revealAtDate;
  const hasStarted = answeredQuestions > 0;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1 text-xs",
        !isDeckReadyToReveal &&
          answeredQuestions === totalQuestions &&
          "text-neutral-700",
      )}
    >
      {isDeckReadyToReveal ? (
        <p>Results</p>
      ) : answeredQuestions === totalQuestions ? (
        <p>Results</p>
      ) : hasStarted ? (
        <p>Continue</p>
      ) : (
        <>
          <p>Start</p>
          <p className="text-gray-400">
            ({revealAtDate && getTimeUntilReveal(revealAtDate, true)} left)
          </p>
        </>
      )}
      <ArrowRightCircle
        width={18}
        height={18}
        fill={
          !isDeckReadyToReveal && answeredQuestions === totalQuestions
            ? "#404040"
            : "#AFADEB"
        }
      />
    </div>
  );
};

const StackDeckCard = ({
  deckId,
  deckName,
  imageUrl,
  revealAtDate,
  userId,
  deckCreditCost = 0,
  deckRewardAmount = 0,
  answeredQuestions,
  totalQuestions,
}: StackDeckCardProps) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const currentDate = new Date();
  const isDeckReadyToReveal = currentDate > revealAtDate;

  const progressPercentage =
    totalQuestions && answeredQuestions
      ? (answeredQuestions / totalQuestions) * 100
      : 0;

  const linkPath = getDeckPath(deckId);

  const Wrapper = !!userId ? "a" : "div";

  return (
    <>
      <LoginPopUp
        deckId={deckId}
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        userId={userId}
      />
      <Wrapper
        onClick={() => {
          if (!userId) setIsLoginModalOpen(true);
        }}
        href={linkPath}
        className="bg-gray-700 rounded-2xl p-2 flex flex-col gap-2 h-full cursor-pointer"
      >
        <div className="flex bg-gray-800 p-2 rounded-2xl gap-2 items-center relative">
          {!(answeredQuestions === totalQuestions) && !isDeckReadyToReveal && (
            <div
              className="absolute top-0 left-0 h-full bg-green opacity-35 z-0 rounded-l-2xl"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          )}
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
          {deckCreditCost === 0 ? (
            <div className="flex items-center gap-2">
              {answeredQuestions === totalQuestions ? (
                isDeckReadyToReveal ? (
                  <div className="flex bg-[#6C633A] justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-white">
                    <TrophyIcon width={16} height={16} />
                    <b>No Rewards</b>
                  </div>
                ) : (
                  <div className="flex bg-[#EDE1AB] justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-black">
                    <Clock3Icon width={16} height={16} />
                    <b>Reveals in {getTimeUntilReveal(revealAtDate, true)}</b>
                  </div>
                )
              ) : isDeckReadyToReveal ? (
                <div className="flex bg-[#6C633A] justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-white">
                  <TrophyIcon width={16} height={16} />
                  <b>No Rewards</b>
                </div>
              ) : (
                <>
                  <div className="flex bg-[#EDE1AB] justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-black">
                    <TrophyIcon width={16} height={16} />
                    <b>No Rewards</b>
                  </div>
                  <div className="flex bg-[#EDE1AB] justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-black">
                    <CoinsIcon width={18} height={18} stroke="#000000" />
                    <b>Free</b>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {answeredQuestions === totalQuestions ? (
                isDeckReadyToReveal ? (
                  <div className="flex bg-[#426D64] justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-white">
                    <TrophyStarMarkIcon width={16} height={16} />
                    <b>{formatNumber(deckRewardAmount!)} BONK</b>
                    <b className="text-white/50">Rewarded</b>
                  </div>
                ) : (
                  <div className="flex bg-chomp-blue-light justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-black">
                    <Clock3Icon width={16} height={16} />
                    <b>Reveals in {getTimeUntilReveal(revealAtDate, true)}</b>
                  </div>
                )
              ) : isDeckReadyToReveal ? (
                <div className="flex bg-[#426D64] justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-white">
                  <TrophyStarMarkIcon width={16} height={16} />
                  <b>0 BONK</b>
                  <b className="text-white/50">Rewarded</b>
                </div>
              ) : (
                <>
                  <div className="flex bg-chomp-blue-light justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-black">
                    <TrophyQuestionMarkIcon width={16} height={16} />
                    <b className="text-black/50">Up to</b>
                    <b>{formatNumber(deckRewardAmount!)} BONK</b>
                  </div>
                  <div className="flex bg-chomp-blue-light justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-black">
                    <CoinsIcon width={18} height={18} stroke="#000000" />
                    <b>{deckCreditCost}</b>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="bg-gray-800 p-3 leading-6 rounded-full">
            {getButtonText(revealAtDate, answeredQuestions, totalQuestions)}
          </div>
        </div>
      </Wrapper>
    </>
  );
};

export default StackDeckCard;
