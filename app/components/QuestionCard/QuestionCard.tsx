"use client";
import { QuestionType } from "@prisma/client";
import classNames from "classnames";
import dayjs from "dayjs";
import Image from "next/image";
import { CSSProperties, ReactNode, useCallback, useState } from "react";
import gatorHeadImage from "../../../public/images/gator-head.png";
import { useInterval } from "../../hooks/useInterval";
import {
  ONE_SECOND_IN_MILISECONDS,
  getDueAtString,
  getRevealedAtString,
} from "../../utils/dateUtils";
import { ClockIcon } from "../Icons/ClockIcon";
import { CountdownIcon } from "../Icons/CountdownIcon";
import { ImageIcon } from "../Icons/ImageIcon";
import { Modal } from "../Modal/Modal";

type QuestionCardProps = {
  question: string;
  type: QuestionType;
  dueAt?: Date;
  onDurationRanOut?: () => void;
  step: number;
  numberOfSteps: number;
  viewImageSrc?: string;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
  isBlurred?: boolean;
  isForReveal?: boolean;
  answer?: string;
};

export function QuestionCard({
  question,
  children,
  viewImageSrc,
  type,
  numberOfSteps,
  step,
  dueAt,
  className,
  onDurationRanOut,
  style,
  isBlurred,
  isForReveal,
  answer,
}: QuestionCardProps) {
  const [isViewImageOpen, setIsViewImageOpen] = useState(false);
  const [dueAtFormatted, setDueAtFormatted] = useState<string>(
    dueAt ? getDueAtString(dueAt) : "",
  );
  const handleDueAtFormatted = useCallback(() => {
    if (!dueAt) return;

    setDueAtFormatted(getDueAtString(dueAt));
    if (dayjs(dueAt).diff(new Date(), "seconds") <= 0) {
      onDurationRanOut && onDurationRanOut();
    }
  }, [setDueAtFormatted, dueAt, onDurationRanOut]);

  useInterval(handleDueAtFormatted, ONE_SECOND_IN_MILISECONDS);

  return (
    <div
      className={classNames("questions-card p-4 pt-6 rounded-lg", className)}
      style={{
        aspectRatio: 0.92,
        ...style,
        position: "relative",
        zIndex: 0, // Ensure the card itself has a z-index
      }}
    >
      <Image
        src={gatorHeadImage}
        alt="gator-head"
        className="absolute bottom-0 left-0 w-full"
        style={{ zIndex: 1 }} // Ensure the image has a proper z-index
      />
      <p
        className={classNames(
          "text-white font-sora text-[24px] leading-[30px] max-w-[330px]",
          {
            "blur-sm": isBlurred,
            "opacity-30": isBlurred,
            "!text-base": type === QuestionType.MultiChoice,
          },
        )}
        style={{ zIndex: 2 }} // Ensure the text has a proper z-index
      >
        {question}
      </p>
      <div style={{ zIndex: 2 }}>{children}</div>
      <div>
        {viewImageSrc && (
          <div
            className="flex items-center gap-[6px] mb-1"
            style={{ zIndex: 2 }}
          >
            <ImageIcon />
            <button
              onClick={() => setIsViewImageOpen(true)}
              className="underline text-white font-sora font-light text-sm"
            >
              View Image
            </button>
            <Modal
              isOpen={isViewImageOpen}
              onClose={() => setIsViewImageOpen(false)}
              title=""
            >
              <img src={viewImageSrc} />
            </Modal>
          </div>
        )}
        <div
          className="flex items-center justify-between w-full"
          style={{ zIndex: 2 }}
        >
          <div
            className="flex justify-start items-center gap-x-1 w-full"
            style={{ zIndex: 2 }}
          >
            {!!dueAt && (
              <>
                {isForReveal ? (
                  <>
                    <ClockIcon fill="#fff" height={30} width={30} />
                    <div className="text-white text-[13px] font-light leading-[16.38px] flex items-center justify-between w-full">
                      <span>{getRevealedAtString(dueAt)}</span>
                      <div className="flex items-center justify-end gap-1.5">
                        {answer && <span>Your Answer</span>}
                        {type === "BinaryQuestion" && answer && (
                          <span className="py-1 px-2 bg-white rounded-2xl text-black text-[10px] font-bold leading-[12.6px] text-left">
                            {answer}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <CountdownIcon fill="#999" />
                    <span className="text-white font-sora text-sm !leading-[14px] font-light">
                      {dueAtFormatted}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
