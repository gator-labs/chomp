"use client";

import { getTimeString } from "@/app/utils/dateUtils";
import { getDeckPath } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { ChompResult, Question, ResultType } from "@prisma/client";
import { isAfter } from "date-fns";
import Image from "next/image";
import { useState } from "react";

import { DeckGraphic } from "../Graphics/DeckGraphic";
import { ArrowRightCircle } from "../Icons/ArrowRightCircle";
import CardsIcon from "../Icons/CardsIcon";
import { ClockIcon } from "../Icons/ClockIcon";
import GiftIcon from "../Icons/GiftIcon";
import HalfEyeIcon from "../Icons/HalfEyeIcon";
import HourGlassIcon from "../Icons/HourGlassIcon";
import LoginPopUp from "../LoginPopUp/LoginPopUp";

type StackDeckCardProps = {
  deckId: number;
  deckName: string;
  imageUrl: string;
  revealAtDate: Date;
  numberOfQuestionsOptions: number;
  numberOfUserQuestionsAnswers: number;
  activeFromDate: Date;
  chompResults: (ChompResult & {
    question: Question;
  })[];
  deckQuestions: Question[];
  userId?: string;
};

const StackDeckCard = ({
  deckId,
  deckName,
  imageUrl,
  revealAtDate,
  numberOfQuestionsOptions,
  numberOfUserQuestionsAnswers,
  activeFromDate,
  chompResults,
  deckQuestions,
  userId,
}: StackDeckCardProps) => {
  const currentDate = new Date();
  const isDeckReadyToReveal = isAfter(currentDate, revealAtDate);
  const isDeckActive = isAfter(currentDate, activeFromDate);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const timeString = getTimeString(
    isDeckActive ? revealAtDate : activeFromDate,
  );

  const answeredQuestionsInPercentage =
    (numberOfUserQuestionsAnswers / numberOfQuestionsOptions) * 100;

  const claimableAmount = chompResults
    .filter((cr) => cr.result === ResultType.Revealed)
    .reduce((acc, cur) => acc + Number(cur.rewardTokenAmount ?? 0), 0);

  const claimedAmount = chompResults
    .filter((cr) => cr.result === ResultType.Claimed)
    .reduce((acc, cur) => acc + Number(cur.rewardTokenAmount ?? 0), 0);

  const revealedAtTimeString = chompResults[0]?.createdAt
    ? getTimeString(chompResults[0].createdAt)
    : "";

  let timeLabel = `Expiring in ${timeString}`;
  if (!isDeckActive) {
    timeLabel = `Starting in ${timeString}`;
  } else if (
    answeredQuestionsInPercentage === 100 &&
    !isDeckReadyToReveal &&
    !!userId
  ) {
    timeLabel = `Reveal in ${timeString}`;
  } else if (chompResults.length === deckQuestions.length && !!userId) {
    if (claimedAmount === 0 || claimableAmount > 0) {
      timeLabel = `Revealed ${revealedAtTimeString} ago`;
    } else {
      timeLabel = `${claimedAmount.toLocaleString("en-US")} BONK claimed`;
    }
  } else if (isDeckReadyToReveal) {
    timeLabel =
      answeredQuestionsInPercentage > 0 && !!userId
        ? "Potential rewards"
        : !!userId
          ? "No potential rewards"
          : "Expired";
  }

  let buttonText = !!userId ? "Continue" : "";
  if (!isDeckActive) {
    buttonText = "Wait to start";
  } else if (answeredQuestionsInPercentage === 0 && !isDeckReadyToReveal) {
    buttonText = "Start";
  } else if (answeredQuestionsInPercentage === 100 && !isDeckReadyToReveal) {
    buttonText = "Wait to reveal";
  } else if (chompResults.length === deckQuestions.length && !!userId) {
    if (claimedAmount === 0 && !!userId) {
      buttonText = "No rewards";
    } else if (claimableAmount > 0) {
      buttonText = "Claim your reward";
    } else {
      buttonText = "View results";
    }
  } else if (isDeckReadyToReveal && !!userId) {
    buttonText = "Reveal results";
  }

  const icon = !isDeckActive ? (
    <HourGlassIcon />
  ) : chompResults.length === deckQuestions.length &&
    (claimedAmount === 0 || claimableAmount > 0) &&
    userId ? (
    <HalfEyeIcon />
  ) : isDeckReadyToReveal && !!userId ? (
    <GiftIcon
      fill={
        answeredQuestionsInPercentage === 0 ||
        chompResults.length === deckQuestions.length
          ? "#999"
          : "#fff"
      }
    />
  ) : (
    <ClockIcon width={16} height={16} />
  );

  const textClass = cn("text-xs", {
    "text-gray-400":
      (chompResults.length === deckQuestions.length &&
        claimedAmount !== 0 &&
        claimableAmount === 0) ||
      (isDeckReadyToReveal &&
        answeredQuestionsInPercentage === 0 &&
        chompResults.length !== deckQuestions.length) ||
      !userId,
  });

  const buttonIconVisible =
    (isDeckActive &&
      answeredQuestionsInPercentage !== 100 &&
      !isDeckReadyToReveal) ||
    (isDeckReadyToReveal && chompResults.length !== deckQuestions.length) ||
    (claimedAmount !== 0 && claimableAmount === 0);

  const giftIconVisible =
    chompResults.length === deckQuestions.length &&
    (claimedAmount === 0 || claimableAmount > 0);

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
        className={cn(
          "p-4 bg-gray-800 border-[0.5px] border-gray-700 rounded-[8px] flex flex-col gap-2",
          {
            "cursor-pointer":
              buttonText === "Claim your reward" ||
              buttonText === "Reveal results" ||
              !userId,
          },
        )}
      >
        <div className="flex gap-4">
          <div className="w-[77px] h-[87px] flex-shrink-0 relative">
            {imageUrl ? (
              <>
                <CardsIcon className="absolute top-0 left-0 w-full h-full" />
                <Image
                  src={imageUrl}
                  alt="logo"
                  width={38}
                  height={38}
                  className="z-10 absolute w-9 h-9 rounded-full top-1/2 left-1/2 translate-x-[-50%] -translate-y-1/2 object-cover"
                />
              </>
            ) : (
              <DeckGraphic className="w-full h-full" />
            )}
          </div>
          <div className="flex flex-col justify-between flex-1">
            <p className="text-[14px] leading-[18.9px] text-purple-100 font-bold">
              {deckName}
            </p>

            <div className="flex justify-between">
              <div className="flex items-center gap-1">
                {icon}
                <p className={textClass}>{timeLabel}</p>
              </div>
              {!!buttonText && (
                <div className="flex items-center gap-1">
                  <p
                    className={cn("text-xs text-nowrap", {
                      "text-gray-400":
                        chompResults.length === deckQuestions.length &&
                        claimedAmount === 0,
                    })}
                  >
                    {buttonText}
                  </p>

                  {buttonIconVisible && (
                    <ArrowRightCircle width={16} height={16} />
                  )}
                  {giftIconVisible && (
                    <GiftIcon
                      fill={
                        (answeredQuestionsInPercentage === 0 ||
                          chompResults.length === deckQuestions.length) &&
                        (claimableAmount === 0 || claimedAmount === 0)
                          ? "#999"
                          : "#fff"
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {answeredQuestionsInPercentage > 0 &&
          answeredQuestionsInPercentage < 100 &&
          !isDeckReadyToReveal && (
            <div className="w-full h-2 bg-gray-700 rounded-[8px] overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full bg-purple-500"
                style={{ width: `${answeredQuestionsInPercentage}%` }}
              />
            </div>
          )}
      </Wrapper>
    </>
  );
};

export default StackDeckCard;
