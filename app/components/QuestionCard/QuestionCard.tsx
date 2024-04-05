"use client";
import { CSSProperties, ReactNode, useCallback, useState } from "react";
import { ImageIcon } from "../Icons/ImageIcon";
import { CountdownIcon } from "../Icons/CountdownIcon";
import classNames from "classnames";
import { useInterval } from "../../hooks/useInterval";
import {
  ONE_SECOND_IN_MILISECONDS,
  getDueAtString,
} from "../../utils/dateUtils";
import dayjs from "dayjs";
import { Modal } from "../Modal/Modal";
import Image from "next/image";

type QuestionCardProps = {
  question: string;
  dueAt?: Date;
  onDurationRanOut?: () => void;
  step: number;
  numberOfSteps: number;
  viewImageSrc?: string;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
  isBlurred?: boolean;
};

export function QuestionCard({
  question,
  children,
  viewImageSrc,
  numberOfSteps,
  step,
  dueAt,
  className,
  onDurationRanOut,
  style,
  isBlurred,
}: QuestionCardProps) {
  const [isViewImageOpen, setIsViewImageOpen] = useState(false);
  const [dueAtFormatted, setDueAtFormatted] = useState<string>(
    dueAt ? getDueAtString(dueAt) : ""
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
    <div className={classNames("questions-card", className)} style={style}>
      <div
        className={classNames("text-white font-sora font-semibold text-base", {
          "blur-sm": isBlurred,
          "opacity-30": isBlurred,
        })}
      >
        {question}
      </div>
      <div>{children}</div>
      <div>
        {viewImageSrc && (
          <div className="flex items-center gap-[6px] mb-1">
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!!dueAt && (
              <>
                <CountdownIcon fill="#999" />
                <span className="text-white font-sora text-sm !leading-[14px] font-light">
                  {dueAtFormatted}
                </span>
              </>
            )}
          </div>
          <div className="flex gap-x-[10px]">
            {Array.from(Array(numberOfSteps).keys()).map((_, index) => (
              <div
                key={index}
                className={classNames("rounded-full w-2 h-2", {
                  "bg-[#CFC5F7]": index + 1 <= step,
                  "bg-white": index + 1 > step,
                })}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
