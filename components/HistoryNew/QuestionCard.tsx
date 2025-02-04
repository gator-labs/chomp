import { ChevronRightIcon } from "@/app/components/Icons/ChevronRightIcon";
import { getTimeUntilReveal } from "@/app/utils/history";
import { QuestionCardIndicatorType } from "@/types/question";
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
  return (
    <div className="bg-gray-700 rounded-lg p-3 gap-6 flex flex-col">
      <div className="text-sm font-medium">{title}</div>

      <div className="flex justify-between">
        <QuestionCardStatus title={deckTitle} indicatorType={indicatorType} />
        {indicatorType != "unrevealed" ? (
          <Link
            href={`/application/answer/reveal/${questionId}`}
            className="flex items-center"
          >
            <div className="flex items-center justify text-xs text-gray-400 gap-1">
              <span>View Answer</span> <ChevronRightIcon />
            </div>
          </Link>
        ) : (
          <div className="flex items-center justify text-xs text-gray-400 gap-1">
            {revealAtDate !== null && getTimeUntilReveal(revealAtDate)}
          </div>
        )}
      </div>
    </div>
  );
}
