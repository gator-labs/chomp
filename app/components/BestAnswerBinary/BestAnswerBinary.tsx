import { ReactNode } from "react";
import { BestAnswer } from "../BestAnswer/BestAnswer";
import classNames from "classnames";


type BestAnswerBinaryProps = {
  optionSelected?: string;
  bestOption: string;
  icon?: ReactNode;
};

export default function BestAnswerBinary({
  optionSelected,
  bestOption,
}: BestAnswerBinaryProps) {
  return (
    <BestAnswer optionSelected={optionSelected} bestOption={bestOption}>
      <div
        className={classNames(
          "flex items-center justify-center gap-1 w-full bg-aqua py-3 text-sm  font-semibold text-gray-800 rounded-lg",
          {
            "bg-destructive": bestOption !== optionSelected,
          },
        )}
      >
        <div>{optionSelected}</div>
      </div>
    </BestAnswer>
  );
}
