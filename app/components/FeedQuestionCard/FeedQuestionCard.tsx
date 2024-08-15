import Image from "next/image";
import { cloneElement, MouseEventHandler, ReactElement } from "react";
import { DeckIcon } from "../Icons/DeckIcon";
import LeadToIcon from "../Icons/LeadToIcon";
import { RevealCardInfo } from "../RevealCardInfo/RevealCardInfo";

type FeedQuestionCardProps = {
  question: string;
  revealAtDate?: Date;
  answerCount?: number;
  image?: string;
  revealAtAnswerCount?: number;
  onTopCornerAction?: MouseEventHandler<HTMLButtonElement> | undefined;
  topCornerActionIcon?: ReactElement;
  statusLabel?: ReactElement;
  action?: ReactElement;
  type?: "Question" | "Deck";
  onClick?: () => void;
};

export function FeedQuestionCard({
  question,
  answerCount,
  revealAtAnswerCount,
  revealAtDate,
  onTopCornerAction,
  topCornerActionIcon,
  statusLabel,
  action,
  type,
  image,
  onClick,
}: FeedQuestionCardProps) {
  return (
    <div
      className="bg-[#333] border-[0.5px] border-[#666] rounded-lg p-4 py-[15px] flex gap-4 h-full"
      onClick={onClick}
    >
      {type === "Deck" && (
        <div>
          <DeckIcon width={77.2} height={87.84} />
        </div>
      )}
      <div className="flex flex-col gap-y-2 w-full justify-between">
        <div className="flex flex-col gap-y-2 w-full">
          <div className="flex gap-2 w-full justify-between">
            {!!image && (
              <div className="relative w-6 h-6 flex-shrink-0">
                <Image
                  src={image}
                  alt="campaign-image"
                  fill
                  className="rounded-full"
                />
              </div>
            )}
            <p className="text-white font-sora font-semibold text-sm mr-auto">
              {question}
            </p>
            {onTopCornerAction && topCornerActionIcon && (
              <button className="cursor-pointer" onClick={onTopCornerAction}>
                {cloneElement(topCornerActionIcon, { height: 18, width: 18 })}
              </button>
            )}
            <div>
              <LeadToIcon width={16} height={13} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-2">
          <div className="flex justify-between items-center">
            <RevealCardInfo
              answerCount={answerCount}
              revealAtAnswerCount={revealAtAnswerCount}
              revealAtDate={revealAtDate}
            />
            {statusLabel}
          </div>
          {action}
        </div>
      </div>
    </div>
  );
}
