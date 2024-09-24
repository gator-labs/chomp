import CheckMarkIcon from "../Icons/CheckMarkIcon";
import IncorrectMarkIcon from "../Icons/IncorrectMarkIcon";

type QuestionAnswerLabelProps = {
  label: string;
  isCorrect: boolean;
};

export default function QuestionAnswerLabel({
  label,
  isCorrect,
}: QuestionAnswerLabelProps) {
  return (
    <div className="bg-gray-600 py-2 px-3 rounded-full inline-flex items-center justify-between gap-2">
      <div className="text-white text-xs font-bold leading-4">{label}</div>
      <div>{isCorrect ? <CheckMarkIcon /> : <IncorrectMarkIcon />}</div>
    </div>
  );
}
