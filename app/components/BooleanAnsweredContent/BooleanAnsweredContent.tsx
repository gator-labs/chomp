import { TrueFalseScaleAnswer } from "../TrueFalseScaleAnswer/TrueFalseScaleAnswer";

type BooleanAnsweredContentProps = {
  questionOptions: {
    id: number;
    isCorrect: boolean;
    isLeft: boolean;
    option: string;
    questionAnswers: {
      percentage: number | null;
      selected: boolean;
      percentageResult?: number | null;
    }[];
  }[];
  avatarSrc?: string;
};

export function BooleanAnsweredContent({
  questionOptions,
  avatarSrc,
}: BooleanAnsweredContentProps) {
  const leftOption = questionOptions.find((qo) => qo.isLeft);
  const ratioLeft = leftOption?.questionAnswers[0]?.percentageResult;
  const ratioSelectedTrue = leftOption?.questionAnswers[0]?.percentage;
  const isTrueCorrect = leftOption?.isCorrect;
  const isTrueSelected = leftOption?.questionAnswers[0]?.selected;
  const labelLeft = leftOption?.option ?? "";
  const labelRight = questionOptions.find((qo) => !qo.isLeft)?.option ?? "";

  return (
    <div className="w-full">
      <div className="mb-2">
        <TrueFalseScaleAnswer
          ratioTrue={ratioLeft}
          valueSelected={ratioSelectedTrue}
          avatarSrc={avatarSrc}
          labelLeft={labelLeft}
          labelRight={labelRight}
          progressColor={
            isTrueCorrect ? "#6DECAF" : isTrueSelected ? "#ED6A5A" : undefined
          }
          bgColor={
            !isTrueCorrect ? "#6DECAF" : !isTrueSelected ? "#2c1e1d" : undefined
          }
        />
      </div>
    </div>
  );
}
