"use client";

import { TRACKING_EVENTS, TRACKING_METADATA } from "@/app/constants/tracking";
import { getTimeUntilReveal } from "@/app/utils/history";
import { formatNumber } from "@/app/utils/number";
import trackEvent from "@/lib/trackEvent";
import { ANSWER_PATH, getDeckPath } from "@/lib/urls";
import classNames from "classnames";
import { TrophyIcon } from "lucide-react";
import Image from "next/image";

import { DeckGraphic } from "../Graphics/DeckGraphic";
import { ArrowRightCircle } from "../Icons/ArrowRightCircle";
import CardsIcon from "../Icons/CardsIcon";
import { CoinsIcon } from "../Icons/CoinsIcon";
import { RevealCardInfo } from "../RevealCardInfo/RevealCardInfo";

type StatusUnion = "chomped" | "new" | "continue" | "start";
type HomeFeedDeckCardProps = {
  deck: string;
  imageUrl?: string | null;
  revealAtDate?: Date | null;
  answerCount?: number;
  date?: Date;
  revealAtAnswerCount?: number;
  status?: StatusUnion;
  deckId: number;
  deckCreditCost?: number;
  deckRewardAmount?: number;
};

const getStatusText = (
  status: StatusUnion,
  revealAtDate: Date | null | undefined,
) => {
  switch (status) {
    case "chomped":
      return "Chomped";
    case "continue":
      return "Continue";
    case "new":
      return "New !";
    case "start":
      return (
        <div className="flex items-center justify-center gap-1 text-xs">
          <p>Start</p>
          <p className="text-gray-400">
            {revealAtDate && getTimeUntilReveal(revealAtDate, true)}
          </p>
          <ArrowRightCircle width={18} height={18} />
        </div>
      );
    default:
      return "";
  }
};

export function HomeFeedDeckCard({
  deck,
  imageUrl,
  revealAtDate,
  answerCount,
  revealAtAnswerCount,
  status,
  date,
  deckId,
  deckCreditCost,
  deckRewardAmount,
}: HomeFeedDeckCardProps) {
  const CREDIT_COST_FEATURE_FLAG =
    process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION === "true";
  return (
    <a
      href={date ? ANSWER_PATH : getDeckPath(deckId)}
      onClick={() => {
        trackEvent(TRACKING_EVENTS.DECK_CLICKED, {
          [TRACKING_METADATA.DECK_ID]: deckId,
          [TRACKING_METADATA.DECK_NAME]: deck,
          [TRACKING_METADATA.IS_DAILY_DECK]: date ? true : false,
        });
      }}
      className="bg-gray-700 rounded-2xl p-2 flex flex-col gap-2 cursor-pointer h-full"
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
                className="z-10 absolute w-9 h-9 rounded-full top-1/2 left-1/2 translate-x-[-50%] -translate-y-1/2 object-cover"
              />
            </>
          ) : (
            <DeckGraphic className="w-full h-full" />
          )}
        </div>
        <div className="text-white font-semibold text-base line-clamp-2">
          {deck}
        </div>
      </div>
      <div className="flex items-center justify-between">
        {CREDIT_COST_FEATURE_FLAG && deckCreditCost != null ? (
          deckCreditCost === 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex bg-[#EDE1AB] justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-black">
                <TrophyIcon width={16} height={16} />
                <b>No Rewards</b>
              </div>
              <div className="flex bg-[#EDE1AB] justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-black">
                <CoinsIcon width={18} height={18} stroke="#000000" />
                <b>Free</b>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex bg-chomp-blue-light justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-black">
                <TrophyIcon width={16} height={16} />
                <b className="text-black/50">Up to</b>
                <b>{formatNumber(deckRewardAmount!)} BONK</b>
              </div>
              <div className="flex bg-chomp-blue-light justify-center items-center rounded-xl p-3 gap-1 font-medium text-xs text-black">
                <CoinsIcon width={18} height={18} stroke="#000000" />
                <b>{deckCreditCost}</b>
              </div>
            </div>
          )
        ) : (
          <RevealCardInfo
            answerCount={answerCount}
            revealAtAnswerCount={revealAtAnswerCount}
            revealAtDate={revealAtDate}
          />
        )}
        <div
          className={classNames("bg-gray-800 p-3 leading-6 rounded-full", {
            "text-aqua": status && ["chomped", "continue"].includes(status),
            "text-gray": status === "new",
            underline: status === "continue",
          })}
        >
          {status && getStatusText(status, revealAtDate)}
        </div>
      </div>
    </a>
  );
}
