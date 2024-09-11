import MultipleChoiceResult from "../MultipleChoiceResult/MultipleChoiceResult";
import PollResult from "../PollResult/PollResult";

type PollResultMultipleChoiceProps = {
  optionSelected?: string;
  percentageSelected?: number;
  isCorrect?: boolean;
  avatarSrc?: string;
  options: Array<{ option: string; label: string; percentage: number }>;
};

export default function PollResultMultipleChoice(
  props: PollResultMultipleChoiceProps,
) {
  const { options } = props;
  return (
    <PollResult {...props} resultProgressComponent={<MultipleChoiceResult />}>
      <div className="flex gap-2 flex-col">
        {options.map((o, index) => (
          <div key={index} className="flex gap-3.5">
            <div className="bg-gray-700 min-w-10 h-10 flex items-center justify-center text-white text-sm  font-bold rounded-lg">
              {o.label}
            </div>
            <MultipleChoiceResult
              text={
                <div className="text-sm  font-light text-white z-10">
                  {o.option}
                </div>
              }
              percentage={o.percentage}
            />
          </div>
        ))}
      </div>
    </PollResult>
  );
}
