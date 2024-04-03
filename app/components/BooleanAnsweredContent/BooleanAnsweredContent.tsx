import { TrueFalseScale } from "../TrueFalseScale/TrueFalseScale";

type BooleanAnsweredContentProps = {
  questionOptions: {
    id: number;
    isTrue: boolean;
    option: string;
    questionAnswer: {
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
  const ratioTrue = questionOptions.find(
    (qo) => qo.option === "True" || qo.option === "Yes"
  )?.questionAnswer[0]?.percentage;
  const ratioSelectedTrue = questionOptions.find(
    (qo) => qo.option === "True" || qo.option === "Yes"
  )?.questionAnswer[0]?.percentageResult;

  return (
    <div className="w-full">
      <div className="mb-2">
        <TrueFalseScale
          ratioTrue={ratioSelectedTrue}
          valueSelected={ratioTrue}
          avatarSrc={avatarSrc}
          labelTrue={isYesNo ? "Yes" : undefined}
          labelFalse={isYesNo ? "No" : undefined}
        />
      </div>
    </div>
  );
}
