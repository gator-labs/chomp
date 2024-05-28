import { CloseIcon } from "../Icons/CloseIcon";
import { RevealCardInfo } from "../RevealCardInfo/RevealCardInfo";

type HomeFeedQuestionCardProps = {
  question: string;
  revealAtDate?: Date;
  answerCount?: number;
  revealAtAnswerCount?: number;
  onClear: () => void;
  onView: () => void;
};

export function HomeFeedQuestionCard({
  question,
  answerCount,
  revealAtAnswerCount,
  revealAtDate,
  onClear,
  onView,
}: HomeFeedQuestionCardProps) {
  return (
    <div className="bg-[#333] border-[#666] rounded-2xl p-4 flex gap-2">
      <div className="flex flex-col gap-y-2 w-full">
        <div className="flex gap-2 w-full justify-between">
          <div className="text-white text-base font-sora font-semibold">
            {question}
          </div>
          <button className="cursor-pointer" onClick={onClear}>
            <CloseIcon height={18} width={18} />
          </button>
        </div>
        <div className="flex justify-between items-center">
          <RevealCardInfo
            answerCount={answerCount}
            revealAtAnswerCount={revealAtAnswerCount}
            revealAtDate={revealAtDate}
          />
          <button
            onClick={onView}
            className="text-xs leading-6 text-white font-bold cursor-pointer"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}
