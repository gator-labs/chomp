"use client";
import Image from "next/image";
import { ReactElement, useState } from "react";
import gatorHeadImage from "../../../public/images/gator-head.png";
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
      <div className="text-base text-grey-0 mb-4 font-sora">{question}</div>
      <Image
        src={gatorHeadImage}
        alt="gator-head"
        className="absolute bottom-0 left-0 w-full z-10"
      />
      {children}
      {viewImageSrc && (
        <div className="flex z-10">
          <Image
            onClick={() => setIsViewImageOpen(true)}
            src={viewImageSrc}
            alt="preview-image"
            className="w-14 rounded-lg cursor-pointer"
            fill
          />

          <Modal
            isOpen={isViewImageOpen}
            onClose={() => setIsViewImageOpen(false)}
            title=""
            variant="image-only"
          >
            <Image fill alt="preview-image" src={viewImageSrc} />
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
          <div className="text-sm text-grey-0 font-sora font-light flex justify-between items-center">
            Your answer {tagElement}
          </div>
        )}
      </div>
    </div>
  );
}
