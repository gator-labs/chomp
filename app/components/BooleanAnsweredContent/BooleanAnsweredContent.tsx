import { TrueFalseScaleAnswer } from "../TrueFalseScaleAnswer/TrueFalseScaleAnswer";

type BooleanAnsweredContentProps = {
  questionOptions: {
    id: number;
    isTrue: boolean;
    option: string;
    questionAnswers: {
      percentage: number | null;
      selected: boolean;
      percentageResult?: number | null;
    }[];
  }[];
  avatarSrc?: string;
  isYesNo?: boolean;
};

export function BooleanAnsweredContent({
  questionOptions,
  avatarSrc,
  isYesNo = false,
}: BooleanAnsweredContentProps) {
  const trueOption = questionOptions.find(
    (qo) => qo.option === "True" || qo.option === "Yes",
  );
  const ratioTrue = trueOption?.questionAnswers[0]?.percentageResult;
  const ratioSelectedTrue = trueOption?.questionAnswers[0]?.percentage;
  const isTrueTrue = trueOption?.isTrue;
  const isTrueSelected = trueOption?.questionAnswers[0]?.selected;

  return (
    <div className="w-full">
      <div className="mb-2">
        <TrueFalseScaleAnswer
          ratioTrue={ratioTrue}
          valueSelected={ratioSelectedTrue}
          avatarSrc={avatarSrc}
          labelTrue={isYesNo ? "Yes" : undefined}
          labelFalse={isYesNo ? "No" : undefined}
          progressColor={
            isTrueTrue ? "#6DECAF" : isTrueSelected ? "#ED6A5A" : undefined
          }
          bgColor={
            !isTrueTrue ? "#6DECAF" : !isTrueSelected ? "#2c1e1d" : undefined
          }
        />
      </div>
    </div>
  );
}
