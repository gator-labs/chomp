import { getRevealedAtString } from "@/app/utils/dateUtils";

import { ClockIcon } from "../Icons/ClockIcon";

type RevealCardInfoProps = {
  revealAtDate?: Date | null;
  answerCount?: number;
  revealAtAnswerCount?: number;
};

export function RevealCardInfo({
  answerCount,
  revealAtAnswerCount,
  revealAtDate,
}: RevealCardInfoProps) {
  const isRevealAtCount =
    answerCount !== undefined &&
    revealAtAnswerCount !== undefined &&
    revealAtAnswerCount !== null;
  return (
    <div className="flex text-xs text-white leading-6 items-center gap-1">
      <ClockIcon />
      <div>
        {revealAtDate && (
          <span className="text-xs font-light">
            {getRevealedAtString(revealAtDate)}{" "}
          </span>
        )}
        {revealAtDate && isRevealAtCount && <span>or </span>}
        {isRevealAtCount && (
          <span>
            {answerCount.toString()}/{revealAtAnswerCount.toString()}
          </span>
        )}
      </div>
    </div>
  );
}
