import { ChevronRightIcon } from "@/app/components/Icons/ChevronRightIcon";
import { getTimeUntilReveal } from "@/app/utils/history";
import { QuestionCardIndicatorType } from "@/types/question";
import { isPast } from "date-fns";
import Link from "next/link";

import { QuestionCardStatus } from "./QuestionCardStatus";

type QuestionCardProps = {
  title: string;
  deckTitle: string;
  questionId: number;
  indicatorType: QuestionCardIndicatorType;
  revealAtDate: Date | null;
};

export function QuestionCard({
  title,
  deckTitle,
  questionId,
  indicatorType,
  revealAtDate,
}: QuestionCardProps) {
  const FF_NEW_ANSWER_PAGE =
    process.env.NEXT_PUBLIC_FF_NEW_ANSWER_PAGE === "true";

  const canViewAnswer =
    (indicatorType == "correct" ||
      indicatorType == "incorrect" ||
      indicatorType == "unanswered") &&
    revealAtDate !== null &&
    isPast(revealAtDate);

  const card = (
    <div className="bg-gray-700 rounded-lg p-3 gap-6 flex flex-col">
      <div className="text-sm font-medium">{title}</div>

      <div className="flex justify-between">
        <QuestionCardStatus title={deckTitle} indicatorType={indicatorType} />
        <div className="flex items-center justify text-xs text-gray-400 gap-1">
          {canViewAnswer ? (
            <>
              <span>View Answer</span> <ChevronRightIcon />
            </>
          ) : (
            <>{revealAtDate !== null && getTimeUntilReveal(revealAtDate)}</>
          )}
        </div>
      </div>
    </div>
  );

  if (!canViewAnswer) return card;

  return (
    <Link
      href={`/application/answer/${FF_NEW_ANSWER_PAGE ? "reveal-new" : "reveal"}/${questionId}`}
      className="block"
    >
      {card}
    </Link>
  );
}
