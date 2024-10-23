import { QuestionAnswer } from "@prisma/client";
import classNames from "classnames";
import { OPTION_LABEL } from "./constants";

type RadioInputProps = {
  name: string;
  options: {
    label: string;
    value: string;
    id: number;
    questionAnswers: QuestionAnswer[];
  }[];
  onOptionSelected: (value: string) => void;
  value?: string;
  randomOptionPercentage?: number;
  randomOptionId?: number;
  showRevealData?: boolean;
};

export function RadioInput({
  name,
  onOptionSelected,
  options,
  value,
  randomOptionPercentage,
  randomOptionId,
  showRevealData,
}: RadioInputProps) {
  const totalNumberOfAnswers = options.flatMap(
    (option) => option.questionAnswers,
  ).length;

  return (
    <div>
      {options.map((o, index) => (
        <div key={index} className="[&:not(:first-of-type)]:mt-4 relative">
          <button
            type="button"
            onClick={() => onOptionSelected(o.value)}
            className="flex items-stretch space-x-2 gap-[14px] min-h-10 w-full"
          >
            <div
              className={classNames(
                "w-10 bg-gray-600 rounded-lg flex items-center justify-center",
                {
                  "!bg-purple-500": !showRevealData && value === o.value,
                  "!bg-aqua": showRevealData && value === o.value,
                },
              )}
            >
              <p
                className={classNames("text-sm font-bold text-white", {
                  "!text-gray-900": value === o.value,
                })}
              >
                {OPTION_LABEL[index as keyof typeof OPTION_LABEL]}
              </p>
            </div>
            <div className="text-sm font-light text-white px-4 border-gray-500 border-[1px] rounded-lg flex items-center flex-1 !m-0 relative overflow-hidden">
              {randomOptionId === o.id && (
                <div
                  className="absolute bg-purple-500 h-full left-0 -z-10"
                  style={{ width: `${randomOptionPercentage}%` }}
                />
              )}

              {showRevealData && (
                <>
                  <div
                    className="absolute bg-gray-600 h-full left-0 -z-10"
                    style={{
                      width: `${(o.questionAnswers.length / totalNumberOfAnswers) * 100 || 0}%`,
                    }}
                  />
                  <p className="absolute right-4 text-sm text-gray-600 font-bold">
                    {(o.questionAnswers.length / totalNumberOfAnswers) * 100 ||
                      0}
                    %
                  </p>
                </>
              )}

              {o.label}
            </div>
          </button>
          <input type="radio" name={name} value={o.value} className="hidden" />
        </div>
      ))}
    </div>
  );
}
