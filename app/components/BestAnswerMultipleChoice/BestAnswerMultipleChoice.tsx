import { BestAnswer } from "../BestAnswer/BestAnswer";
import MultipleChoiceResult from "../MultipleChoiceResult/MultipleChoiceResult";

type BestAnswerMultipleChoiceProps = {
  optionSelected?: string;
  bestOption: string;
  optionLabel: string;
};

export default function BestAnswerMultipleChoice({
  optionSelected,
  bestOption,
  optionLabel,
}: BestAnswerMultipleChoiceProps) {
  return (
    <BestAnswer optionSelected={optionSelected} bestOption={bestOption}>
      <div className="flex gap-3.5">
        <MultipleChoiceResult
          text={
            <div className="text-sm  font-light text-white">{optionLabel}</div>
          }
        />
      </div>
    </BestAnswer>
  );
}
