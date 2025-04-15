import { SecondOrderOptionResultsMultiple } from "@/app/application/answer/reveal-new/[questionId]/page";
import { InfoIcon } from "@/app/components/Icons/InfoIcon";

import AquaCheckIcon from "./icons/AquaCheckIcon";
import RedXIcon from "./icons/RedXIcon";

export type SecondOrderAnswerResultsMultipleProps = {
  options: SecondOrderOptionResultsMultiple;
  isSelectedCorrect: boolean | null;
  selectedPercentage: number;
  openSecOrdAnsInfDrawer: () => void;
};

export default function SecondOrderAnswerResultsMultiple({
  options,
  isSelectedCorrect,
  selectedPercentage,
  openSecOrdAnsInfDrawer,
}: SecondOrderAnswerResultsMultipleProps) {
  const selectedQuestion = options.find((op) => op.isSelected);

  return (
    <div className="bg-gray-700 rounded-xl my-3">
      <div
        className={`${isSelectedCorrect ? "bg-dark-green" : "bg-dark-red"} text-white flex justify-between items-center rounded-t-xl py-2 px-4`}
      >
        <p className="pl-2 font-bold">Second Order Answer</p>

        {isSelectedCorrect ? (
          <AquaCheckIcon width={32} height={32} />
        ) : (
          <RedXIcon width={32} height={32} />
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start text-white mb-2">
          <p className="font-medium ml-2">
            This shows how users thought the crowd would vote for the best
            answer.
          </p>
          <span
            onClick={() => openSecOrdAnsInfDrawer()}
            className="cursor-pointer ml-6 mr-1"
          >
            <InfoIcon width={24} height={24} fill="#FFFFFF" />
          </span>
        </div>

        <div className="mt-4 pr-4 pl-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              {/* Letter box - fixed width */}
              <div className="flex items-center justify-center bg-gray-600 w-12 h-12 rounded-lg mr-1 flex-shrink-0">
                <span className="text-white text-xl font-medium">
                  {option.label}
                </span>
              </div>

              {/* Progress bar container - full width */}
              <div className="flex-grow relative">
                <div className="h-12 w-full rounded-lg border border-gray-500 overflow-hidden">
                  <div
                    className="bg-gray-600 h-full rounded-l-lg"
                    style={{ width: `${option.percentage}%` }}
                  ></div>
                </div>

                <div className="absolute inset-0 flex items-center px-2">
                  <span className="text-white text-lg pl-2">{option.text}</span>
                </div>
              </div>

              {/* Percentage - fixed width */}
              <div className="text-white text-xl font-medium ml-2 w-16 text-right flex-shrink-0">
                {option.percentage}%
              </div>
            </div>
          ))}
        </div>

        {/** Horizontal --- Line **/}
        <div className="mt-4 border-t border-gray-600 pr-4">
          {
            // Your prediction was xxx correct
            isSelectedCorrect ? (
              <p className="mt-4 text-green font-medium text-sm">
                Nice! Your prediction was within the reward range.
              </p>
            ) : (
              <p className="text-chomp-red-light font-medium text-sm mt-4">
                Your prediction was not within the reward range this time, on to
                the next one!
              </p>
            )
          }

          <div className="flex items-center mb-2 mt-4">
            {/* Letter box - fixed width */}
            <div className="flex items-center justify-center bg-gray-600 w-12 h-12 rounded-lg mr-1 flex-shrink-0">
              <span className="text-white text-xl font-medium">
                {selectedQuestion?.label}
              </span>
            </div>

            {/* Progress bar container - full width */}
            <div className="flex-grow relative">
              <div className="h-12 w-full rounded-lg border border-gray-500 overflow-hidden">
                <div
                  className={`${isSelectedCorrect ? "bg-dark-green" : "bg-dark-red"} h-full rounded-l-lg`}
                  style={{ width: `${selectedPercentage}%` }}
                ></div>
              </div>

              <div className="absolute inset-0 flex items-center px-2">
                <span className="text-white text-lg pl-2">
                  {selectedQuestion?.text}
                </span>
              </div>
            </div>

            {/* Percentage - fixed width */}
            <div className="text-white text-xl font-medium ml-2 w-16 text-right flex-shrink-0">
              {selectedPercentage}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
