import { QuestionHistory } from "@/app/queries/history";
import { getQuestionStatus, getRevealAtText } from "@/app/utils/history";
import { cn } from "@/app/utils/tailwind";
import Link from "next/link";
import { forwardRef } from "react";
import { Button } from "../Button/Button";
import { ClockIcon } from "../Icons/ClockIcon";
import { DollarIcon } from "../Icons/DollarIcon";
import { EyeIcon } from "../Icons/EyeIcon";
import LeadToIcon from "../Icons/LeadToIcon";

const QuestionRowCard = forwardRef<HTMLLIElement, QuestionHistory>(
  (question, ref) => {
    const revealAtText = getRevealAtText(question.revealAtDate);

    const questionStatus = getQuestionStatus({
      isAnswered: question.isAnswered,
      isClaimed: question.isClaimed,
      isRevealable: question.isRevealable,
      claimedAmount: question.claimedAmount,
    });

    return (
      <li
        className="px-4 py-[15px] rounded-lg bg-[#333333] border-[0.5px] border-[#666666] flex flex-col gap-2"
        key={question.id}
        ref={ref}
      >
        <div className="flex gap-4 justify-between items-start">
          <p className="text-sm text-white">{question.question}</p>
          <div>
            <LeadToIcon width={16} height={13} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex text-xs text-white items-center gap-1">
            <ClockIcon width={15} height={15} />
            <p className="text-xs font-light -mb-0.5">{revealAtText}</p>
          </div>
          <p
            className={cn("text-xs text-[#6DECAF]", {
              "text-[#CFC5F7] underline":
                questionStatus === "Reveal unchomped question",
            })}
          >
            {questionStatus}
          </p>
        </div>

        {question.isRevealable && question.isAnswered && (
          <Button className="h-[50px] flex gap-1" variant="grayish">
            Reveal
            <EyeIcon />
          </Button>
        )}
        {question.isClaimable && (
          <Button className="h-[50px] flex gap-1" variant="grayish">
            Claim
            <DollarIcon />
          </Button>
        )}
        {(question.isClaimed || question.isRevealed) && (
          <Link href={`/application/answer/reveal/${question.id}`}>
            <Button className="h-[50px] flex gap-1" variant="grayish">
              View
              <EyeIcon />
            </Button>
          </Link>
        )}
      </li>
    );
  },
);

QuestionRowCard.displayName = "QuestionRowCard";

export default QuestionRowCard;
