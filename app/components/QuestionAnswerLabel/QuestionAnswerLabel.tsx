import CheckMarkIcon from "../Icons/CheckMarkIcon";

type QuestionAnswerLabelProps = {
  label: string;
};

export default function QuestionAnswerLabel({
  label,
}: QuestionAnswerLabelProps) {
  return (
    <div className="bg-[#4D4D4D] py-2 px-3 rounded-full inline-flex items-center justify-between gap-2">
      <div className="text-white text-xs font-bold leading-4">{label}</div>
      <div>
        <CheckMarkIcon />
      </div>
    </div>
  );
}
