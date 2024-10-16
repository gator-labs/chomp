import classNames from "classnames";
import { BestAnswer } from "../BestAnswer/BestAnswer";

type BestAnswerMultipleChoiceProps = {
  optionSelected?: string;
  bestOption: string;
  optionLabel?: string;
};

export default function BestAnswerMultipleChoice({
  optionSelected,
  bestOption,
}: BestAnswerMultipleChoiceProps) {
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
