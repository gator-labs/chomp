import { QuestionCorrectIcon } from "@/app/components/Icons/QuestionCorrectIcon";
import { QuestionIncorrectIcon } from "@/app/components/Icons/QuestionIncorrectIcon";
import { QuestionUnansweredIcon } from "@/app/components/Icons/QuestionUnansweredIcon";
import { QuestionUnrevealedIcon } from "@/app/components/Icons/QuestionUnrevealedIcon";
import { QuestionCardIndicatorType } from "@/types/question";

type QuestionCardStatusProps = {
  title: string;
  indicatorType: QuestionCardIndicatorType;
};

export function QuestionCardStatus({
  title,
  indicatorType,
}: QuestionCardStatusProps) {
  const icon =
    indicatorType == "correct" ? (
      <QuestionCorrectIcon className="flex-grow" />
    ) : indicatorType == "incorrect" ? (
      <QuestionIncorrectIcon className="flex-grow" />
    ) : indicatorType == "unanswered" ? (
      <QuestionUnansweredIcon className="flex-grow" />
    ) : (
      <QuestionUnrevealedIcon className="flex-grow" />
    );

  return (
    <div className="flex rounded-sm gap-1 p-1">
      {icon}
      <div className="bg-gray-800 rounded-sm px-1 align-middle justify-center items-center text-xs font-medium px-2 w-[200px] flex">
        <span className="min-w-0 flex-1 truncate">{title}</span>
      </div>
    </div>
  );
}
