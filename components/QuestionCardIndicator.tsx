import { QuestionCorrectIcon } from "@/app/components/Icons/QuestionCorrectIcon";
import { QuestionIncorrectIcon } from "@/app/components/Icons/QuestionIncorrectIcon";
import { QuestionUnansweredIcon } from "@/app/components/Icons/QuestionUnansweredIcon";
import { QuestionUnrevealedIcon } from "@/app/components/Icons/QuestionUnrevealedIcon";

type QuestionCardIndicatorType =
  | "correct"
  | "incorrect"
  | "unanswered"
  | "unrevealed";

type QuestionCardIndicatorProps = {
  count: number;
  indicatorType: QuestionCardIndicatorType;
};

export function QuestionCardIndicator({
  count,
  indicatorType,
}: QuestionCardIndicatorProps) {
  const icon =
    indicatorType == "correct" ? (
      <QuestionCorrectIcon />
    ) : indicatorType == "incorrect" ? (
      <QuestionIncorrectIcon />
    ) : indicatorType == "unanswered" ? (
      <QuestionUnansweredIcon />
    ) : (
      <QuestionUnrevealedIcon />
    );

  return (
    <div className="grid grid-cols-2 bg-gray-600 rounded-sm gap-1 p-1">
      {icon}
      <div className="bg-gray-800 rounded-sm px-1 flex items-center justify-center">
        {count}
      </div>
    </div>
  );
}
