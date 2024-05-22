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
} from "../../utils/dateUtils";
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
      }}
    >
      <Image
        src={gatorHeadImage}
        alt="gator-head"
        className="absolute bottom-0 left-0 w-full"
      />
      <p
        className={classNames(
          "text-white font-sora text-[24px] leading-[30px]",
          {
            "blur-sm": isBlurred,
            "opacity-30": isBlurred,
            "!text-base": type === QuestionType.MultiChoice,
          },
        )}
      >
        {question}
      </p>
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
        </div>
      </div>
    </div>
  );
}
