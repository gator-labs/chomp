import { ReactNode } from "react";

import { BestAnswer } from "../BestAnswer/BestAnswer";

type BestAnswerBinaryProps = {
  optionSelected?: string;
  bestOption: string;
};

export default function BestAnswerBinary({
  optionSelected,
  bestOption,
}: BestAnswerBinaryProps) {
  return (
    <BestAnswer optionSelected={optionSelected} bestOption={bestOption}>
      <div className="flex items-center justify-center gap-1 w-full bg-aqua py-3 text-sm  font-semibold text-gray-800 rounded-lg">
        <div>{bestOption}</div>
      </div>
    </BestAnswer>
  );
}
