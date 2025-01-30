import { ChevronRightIcon } from "@/app/components/Icons/ChevronRightIcon";
import { QuestionCardIndicatorType } from "@/types/question";

import { QuestionCardStatus } from "./QuestionCardStatus";

type QuestionCardProps = {
  title: string;
  deckTitle: string;
  questionId: number;
  indicatorType: QuestionCardIndicatorType;
};

export function QuestionCard({
  title,
  deckTitle,
  questionId,
  indicatorType,
}: QuestionCardProps) {
  return (
    <div className="bg-gray-700 rounded-lg p-3 gap-6 flex flex-col">
      <div className="text-sm font-medium">{title}</div>

      <div className="flex justify-between">
        <QuestionCardStatus title={deckTitle} indicatorType={"unanswered"} />
        <div className="flex items-center justify text-xs text-gray-400 gap-1">
          <span>View Answer</span> <ChevronRightIcon />
        </div>
      </div>
    </div>
  );
}
