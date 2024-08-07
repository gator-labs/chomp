"use client";
import { QuestionType } from "@prisma/client";
import classNames from "classnames";
import dayjs from "dayjs";
import Image from "next/image";
import { CSSProperties, ReactNode, useCallback, useState } from "react";
import gatorHeadImage from "../../../public/images/gator-head.png";
import { useInterval } from "../../hooks/useInterval";
import {
  ONE_SECOND_IN_MILLISECONDS,
  getDueAtString,
} from "../../utils/dateUtils";
import { CountdownIcon } from "../Icons/CountdownIcon";
import { Modal } from "../Modal/Modal";

type QuestionCardProps = {
  question: string;
  type: QuestionType;
  dueAt?: Date;
  onDurationRanOut?: () => void;
  viewImageSrc?: string;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
  isBlurred?: boolean;
  answer?: string;
};

export function QuestionCard({
  question,
  children,
  viewImageSrc,
  type,
  dueAt,
  className,
  onDurationRanOut,
  style,
  isBlurred,
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

  useInterval(handleDueAtFormatted, ONE_SECOND_IN_MILLISECONDS);

  return (
    <div
      className={classNames(
        "questions-card p-4 pt-6 rounded-lg z-0 flex-grow h-full",
        className,
      )}
      style={{
        ...style,
        position: "relative",
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
          "text-white font-sora text-[24px] leading-[30px] max-w-[330px] z-10",
          {
            "blur-sm": isBlurred,
            "opacity-30": isBlurred,
            "!text-base": type === QuestionType.MultiChoice,
          },
        )}
      >
        {question}
      </p>
      <div className="z-10">{children}</div>
      <div className="relative z-50 flex justify-between items-end">
        <div className="flex items-center justify-between z-10">
          <div className="flex justify-start items-center gap-x-1 w-full z-10">
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
        {viewImageSrc && (
          <div className="flex z-10">
            <Image
              onClick={() => setIsViewImageOpen(true)}
              src={viewImageSrc}
              alt="preview-image"
              className="w-14 rounded-lg cursor-pointer"
              width={56}
              height={56}
            />

            <Modal
              isOpen={isViewImageOpen}
              onClose={() => setIsViewImageOpen(false)}
              title=""
              variant="image-only"
            >
              <img alt="preview-image" src={viewImageSrc} />
            </Modal>
          </div>
        )}
      </div>
    </div>
  );
}
