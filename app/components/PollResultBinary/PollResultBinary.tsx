import { BINARY_QUESTION_OPTION_LABELS } from "@/app/utils/question";
import BinaryResult from "../BinaryResult/BinaryResult";
import LikeIcon from "../Icons/LikeIcon";
import UnlikeIcon from "../Icons/UnlikeIcon";
import MultipleChoiceResult from "../MultipleChoiceResult/MultipleChoiceResult";
import PollResult from "../PollResult/PollResult";

type PollResultBinaryProps = {
  optionSelected?: string;
  percentageSelected?: number;
  isCorrect?: boolean;
  avatarSrc?: string;
  leftOption: { option: string; percentage: number };
  rightOption: { option: string; percentage: number };
};

export default function PollResultBinary(props: PollResultBinaryProps) {
  const { leftOption, rightOption } = props;
  return (
    <PollResult {...props} resultProgressComponent={<MultipleChoiceResult />}>
      <div className="flex gap-2 flex-col">
        <div className="flex gap-3.5">
          {BINARY_QUESTION_OPTION_LABELS.includes(leftOption.option) && (
            <div className="bg-grey-700 min-w-10 h-10 flex items-center justify-center text-grey-0 text-sm font-sora font-bold rounded-lg">
              <LikeIcon fill="#fff" />
            </div>
          )}
          <BinaryResult
            optionSelected={leftOption.option}
            percentage={leftOption.percentage}
          />
        </div>
        <div className="flex gap-3.5">
          {BINARY_QUESTION_OPTION_LABELS.includes(leftOption.option) && (
            <div className="bg-grey-700 min-w-10 h-10 flex items-center justify-center text-grey-0 text-sm font-sora font-bold rounded-lg">
              <UnlikeIcon fill="#fff" />
            </div>
          )}
          <BinaryResult
            optionSelected={rightOption.option}
            percentage={rightOption.percentage}
          />
        </div>
      </div>
    </PollResult>
  );
}
