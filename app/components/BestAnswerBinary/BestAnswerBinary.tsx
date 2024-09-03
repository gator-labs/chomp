import { ReactNode } from "react";
import { BestAnswer } from "../BestAnswer/BestAnswer";

type BestAnswerBinaryProps = {
  optionSelected?: string;
  bestOption: string;
  icon?: ReactNode;
};

export default function BestAnswerBinary({
  optionSelected,
  bestOption,
  icon,
}: BestAnswerBinaryProps) {
  return (
    <BestAnswer optionSelected={optionSelected} bestOption={bestOption}>
      <div className="flex items-center justify-center gap-1 w-full bg-aqua py-3 text-sm font-sora font-semibold text-grey-850 rounded-lg">
        <div>{bestOption}</div> {icon}
      </div>
    </BestAnswer>
  );
}
