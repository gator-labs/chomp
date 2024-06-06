import { BestAnswer } from "../BestAnswer/BestAnswer";
import MultipleChoiceResult from "../MultipleChoiceResult/MultipleChoiceResult";

type BestAnswerMultipleChoiceProps = {
  optionSelected: string;
  bestOption: string;
  optionLabel: string;
};

export default function BestAnswerMultipleChoice({
  optionSelected,
  bestOption,
  optionLabel,
}: BestAnswerMultipleChoiceProps) {
  return (
    <BestAnswer optionSelected={optionSelected}>
      <div className="flex gap-3.5">
        <div className="bg-aqua min-w-10 h-10 flex justify-center items-center text-sm font-sora font-bold rounded-lg">
          {bestOption}
        </div>
        <MultipleChoiceResult
          text={
            <div className="text-sm font-sora font-light text-white">
              {optionLabel}
            </div>
          }
        />
      </div>
    </BestAnswer>
  );
}
