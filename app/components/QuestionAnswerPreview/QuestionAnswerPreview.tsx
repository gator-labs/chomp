"use client";
import Image from "next/image";
import { ReactElement, useState } from "react";
import gatorHeadImage from "../../../public/images/gator-head.png";
import { ImageIcon } from "../Icons/ImageIcon";
import { Modal } from "../Modal/Modal";
import { RevealCardInfo } from "../RevealCardInfo/RevealCardInfo";

type QuestionAnswerPreviewProps = {
  question: string;
  viewImageSrc?: string;
  revealAtDate?: Date;
  answerCount?: number;
  revealAtAnswerCount?: number;
  children?: ReactElement;
  tagElement?: ReactElement;
};

export default function QuestionAnswerPreview({
  question,
  viewImageSrc,
  revealAtAnswerCount,
  answerCount,
  revealAtDate,
  children,
  tagElement,
}: QuestionAnswerPreviewProps) {
  const [isViewImageOpen, setIsViewImageOpen] = useState(false);

  return (
    <div className="questions-card p-4 pt-6 rounded-lg z-0 flex-grow h-full min-h-[216px] relative">
      <div className="text-base text-white mb-4 font-sora">{question}</div>
      <Image
        src={gatorHeadImage}
        alt="gator-head"
        className="absolute bottom-0 left-0 w-full z-10"
      />
      {children}
      {viewImageSrc && (
        <div className="flex items-center gap-[6px] mb-1 z-20">
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
      <div className="flex justify-between items-center">
        <RevealCardInfo
          answerCount={answerCount}
          revealAtAnswerCount={revealAtAnswerCount}
          revealAtDate={revealAtDate}
        />
        {!!tagElement?.props.children && (
          <div className="text-sm text-white font-sora font-light flex justify-between items-center">
            Your answer {tagElement}
          </div>
        )}
      </div>
    </div>
  );
}
