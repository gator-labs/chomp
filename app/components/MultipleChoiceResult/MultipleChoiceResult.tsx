import { ReactElement } from "react";

type MultipleChoiceResultProps = {
  text?: ReactElement;
  percentage?: number;
  disablePercentageLabel?: boolean;
};

export default function MultipleChoiceResult({
  text,
  percentage,
  disablePercentageLabel = false,
}: MultipleChoiceResultProps) {
  return (
    <div className="border-[#666666] border-[1px] rounded-lg flex items-center w-full justify-between px-4 relative overflow-hidden">
      {text}
      {!disablePercentageLabel && percentage && (
        <div className="font-bold text-sm text-[#4d4d4d]">{percentage}%</div>
      )}
      {percentage && (
        <div
          className="bg-[#4d4d4d] h-full absolute"
          style={{ left: "-5px", width: `calc(${percentage}% + 5px)` }}
        ></div>
      )}
    </div>
  );
}
