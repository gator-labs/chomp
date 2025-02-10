"use client";

import { TRACKING_EVENTS, TRACKING_METADATA } from "@/app/constants/tracking";
import { formatNumber } from "@/app/utils/number";
import trackEvent from "@/lib/trackEvent";
import { ANSWER_PATH, getDeckPath } from "@/lib/urls";
import classNames from "classnames";
import { BadgeDollarSignIcon } from "lucide-react";
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

const getStatusText = (status: StatusUnion) => {
  switch (status) {
    case "chomped":
      return "Chomped";
    case "continue":
      return "Continue";
    case "new":
      return "New !";
    case "start":
      return (
        <div className="flex items-center justify-center gap-1">
          <p>Start</p>
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
          <div
            className={classNames(
              "flex flex-row justify-center items-center rounded-2xl p-2 gap-2 font-medium",
              {
                "bg-[#D0CBB4]": deckCreditCost === 0,
                "bg-chomp-blue-light": deckCreditCost > 0,
              },
            )}
          >
            {deckCreditCost === 0 ? (
              <>
                <span className="flex bg-black/30 rounded-xl items-center py-1.5 px-2 gap-1">
                  <BadgeDollarSignIcon width={18} height={18} />
                  <p>No Rewards</p>
                </span>
                <span className="flex bg-black/30 rounded-xl items-center py-1.5 px-2 gap-1">
                  <CoinsIcon width={18} height={18} />
                  <p>Free</p>
                </span>
              </>
            ) : (
              <>
                <span className="flex bg-black/30 rounded-xl items-center py-1.5 px-2 gap-1">
                  <BadgeDollarSignIcon width={18} height={18} />
                  <p>{formatNumber(deckRewardAmount!)} BONK</p>
                </span>
                <span className="flex bg-black/30 rounded-xl items-center py-1.5 px-2 gap-1">
                  <CoinsIcon width={18} height={18} />
                  <p>
                    {deckCreditCost} Credit{deckCreditCost !== 1 ? "s" : ""}
                  </p>
                </span>
              </>
            )}
          </div>
        ) : (
          <RevealCardInfo
            answerCount={answerCount}
            revealAtAnswerCount={revealAtAnswerCount}
            revealAtDate={revealAtDate}
          />
        )}
        <div
          className={classNames("bg-gray-800 p-[14px] leading-6 rounded-2xl", {
            "text-aqua": status && ["chomped", "continue"].includes(status),
            "text-gray": status === "new",
            underline: status === "continue",
          })}
        >
          {status && getStatusText(status)}
        </div>
      </div>
    </a>
  );
}
