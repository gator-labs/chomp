"use client";

import { TRACKING_EVENTS, TRACKING_METADATA } from "@/app/constants/tracking";
import { getTimeUntilReveal } from "@/app/utils/history";
import { formatNumber } from "@/app/utils/number";
import DeckWrapper from "@/components/Deck/DeckWrapper";
import trackEvent from "@/lib/trackEvent";
import { ANSWER_PATH, getDeckPath } from "@/lib/urls";
import classNames from "classnames";
import { TrophyIcon } from "lucide-react";

import { ArrowRightCircle } from "../Icons/ArrowRightCircle";
import { CoinsIcon } from "../Icons/CoinsIcon";
import TrophyQuestionMarkIcon from "../Icons/TrophyQuestionMarkIcon";
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
  totalQuestions?: number;
  answeredQuestions?: number;
};

const getStatusText = (
  status: StatusUnion,
  revealAtDate: Date | null | undefined,
  answeredQuestions: number | undefined,
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
          {answeredQuestions && answeredQuestions > 0 ? (
            <p>Continue</p>
          ) : (
            <>
              <p>Start</p>
              <p className="text-gray-400">
                ({revealAtDate && getTimeUntilReveal(revealAtDate, true)} left)
              </p>
            </>
          )}
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
  totalQuestions,
  answeredQuestions,
}: HomeFeedDeckCardProps) {
  const CREDIT_COST_FEATURE_FLAG =
    process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION === "true";

  const progressPercentage =
    totalQuestions && answeredQuestions
      ? (answeredQuestions / totalQuestions) * 100
      : 0;
  return (
    <DeckWrapper
      linkPath={date ? ANSWER_PATH : getDeckPath(deckId)}
      onClick={() => {
        trackEvent(TRACKING_EVENTS.DECK_CLICKED, {
          [TRACKING_METADATA.DECK_ID]: deckId,
          [TRACKING_METADATA.DECK_NAME]: deck,
          [TRACKING_METADATA.IS_DAILY_DECK]: date ? true : false,
        });
      }}
      wrapperType="a"
      answeredQuestions={answeredQuestions}
      progressPercentage={progressPercentage}
      imageUrl={imageUrl}
      deckTitle={deck}
    >
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
                <TrophyQuestionMarkIcon width={16} height={16} />
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
          {status && getStatusText(status, revealAtDate, answeredQuestions)}
        </div>
      </div>
    </DeckWrapper>
  );
}
