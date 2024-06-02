import { cloneElement, ReactElement } from "react";
import { RevealCardInfo } from "../RevealCardInfo/RevealCardInfo";

type HomeFeedQuestionCardProps = {
  question: string;
  revealAtDate?: Date;
  answerCount?: number;
  revealAtAnswerCount?: number;
  onTopCornerAction?: () => void;
  topCornerActionIcon?: ReactElement;
  statusLabel: ReactElement;
  action?: ReactElement;
};

export function HomeFeedQuestionCard({
  question,
  answerCount,
  revealAtAnswerCount,
  revealAtDate,
  onTopCornerAction,
  topCornerActionIcon,
  statusLabel,
  action,
}: HomeFeedQuestionCardProps) {
  return (
    <div className="bg-[#333] border-[#666] rounded-2xl p-4 flex gap-2 h-full">
      <div className="flex flex-col gap-y-2 w-full justify-between">
        <div className="flex flex-col gap-y-2 w-full">
          <div className="flex gap-2 w-full justify-between">
            <div className="text-white text-base font-sora font-semibold">
              {question}
            </div>
            {onTopCornerAction && topCornerActionIcon && (
              <button className="cursor-pointer" onClick={onTopCornerAction}>
                {cloneElement(topCornerActionIcon, { height: 18, width: 18 })}
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-y-2">
          {action}
          <div className="flex justify-between items-center">
            <RevealCardInfo
              answerCount={answerCount}
              revealAtAnswerCount={revealAtAnswerCount}
              revealAtDate={revealAtDate}
            />
            {statusLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
