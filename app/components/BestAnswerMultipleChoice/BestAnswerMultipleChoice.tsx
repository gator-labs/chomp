import { BestAnswer } from "../BestAnswer/BestAnswer";
import LikeIcon from "../Icons/LikeIcon";
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
        <div className="bg-aqua min-w-10 h-10 flex justify-center items-center text-sm  font-bold rounded-lg">
          <LikeIcon fill="#fff" />
        </div>
        <MultipleChoiceResult
          text={
            <div className="text-sm  font-light text-white">{optionLabel}</div>
          }
        />
      </div>
    </BestAnswer>
  );
}
