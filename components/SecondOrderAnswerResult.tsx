import { InfoIcon } from "@/app/components/Icons/InfoIcon";
import { getAlphaIdentifier } from "@/app/utils/question";
import { cn } from "@/lib/utils";
import { QuestionOrderPercentage, UserAnswer } from "@/types/answerStats";

import SecondOrderAnswerInfoDrawer from "./SecondOrderAnswerInfoDrawer";
import AquaCheckIcon from "./icons/AquaCheckIcon";
import RedXIcon from "./icons/RedXIcon";

export type SecondOrderAnswerResultsProps = {
  userAnswers: UserAnswer[];
  questionOptionPercentages: QuestionOrderPercentage[];
  answerStatus: boolean | null;
  isDrawerOpen: boolean;
  showLetters: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

export default function SecondOrderAnswerResults({
  userAnswers,
  questionOptionPercentages,
  answerStatus,
  isDrawerOpen,
  showLetters,
  openDrawer,
  closeDrawer,
}: SecondOrderAnswerResultsProps) {
  const selectedAnswer = userAnswers.find((ans) => ans.percentage !== null);
  const selectedQOId = selectedAnswer?.questionOptionId ?? null;
  const selectedPercentage = selectedAnswer?.percentage ?? null;

  const options = questionOptionPercentages.map((qop, index) => ({
    isSelected: qop.id === selectedQOId,
    text: qop.option,
    label: getAlphaIdentifier(index),
    percentage: qop.secondOrderAveragePercentagePicked,
  }));

  // Is correct and we have an answer
  const isSelectedCorrect = answerStatus && selectedPercentage !== null;

  // WARNING: this could be hidding a bug, its gonna be reviewed in
  // https://linear.app/gator/issue/PROD-1029/issecondordercorrect-true-even-though-no-2nd-order-answer
  // Mystery Box is not opened yet so we don't know if the user is right or wrong or there's no answer
  const isNotOpenedYet = answerStatus === null || selectedPercentage === null;

  if (answerStatus === true && selectedPercentage === null) {
    console.warn(
      "Second Order Answser says its correct but has not selected percentage",
    );
  }

  // Variable to distinguish between the three states after correcting possible db inconsistencies
  // null if unanswered
  // replace all isSelectedCorrectNullIfNotOpened with correctIncorrectOrUnanswered
  const correctIncorrectOrUnanswered = isNotOpenedYet
    ? null
    : isSelectedCorrect;

  const selectedQuestion = options.find((op) => op.isSelected);
  return (
    <div className="bg-gray-700 rounded-xl my-3">
      <div
        className={cn(
          `text-white flex justify-between items-center rounded-t-xl py-2 pl-4 pr-2`,
          {
            "bg-dark-green": correctIncorrectOrUnanswered === true,
            "bg-dark-red": correctIncorrectOrUnanswered === false,
            "bg-gray-600": correctIncorrectOrUnanswered === null,
          },
        )}
      >
        <p className="pl-2 font-bold">Second Order Answer</p>

        {isNotOpenedYet ? null : isSelectedCorrect ? (
          <AquaCheckIcon width={32} height={32} />
        ) : (
          <RedXIcon width={32} height={32} />
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start text-white mb-2">
          <p className="text-sm ml-2 font-medium">
            This shows how users thought the crowd would vote for the best
            answer.
          </p>
          <span
            onClick={() => openDrawer()}
            className="cursor-pointer ml-6 mr-1"
          >
            <InfoIcon width={24} height={24} fill="#FFFFFF" />
          </span>
        </div>

        <div className="mt-4 pr-4 pl-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              {/* Letter box - fixed width */}
              {showLetters && (
                <div className="flex items-center justify-center bg-gray-600 w-12 h-12 rounded-lg mr-1 flex-shrink-0">
                  <span className="text-white text-xl font-medium">
                    {option.label}
                  </span>
                </div>
              )}

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
            // Mystery box not opened or opened but no user answer
            isNotOpenedYet ? (
              <p className="text-sm mt-4 text-gray-500 font-medium">
                You did not answer this question
              </p>
            ) : // Your prediction was correct
            isSelectedCorrect ? (
              <p className="mt-4 text-green font-medium text-sm">
                Nice! Your prediction was within the reward range.
              </p>
            ) : (
              // Your prediction was not correct
              <p className="mt-4 text-chomp-red-light font-medium text-sm">
                Your prediction was not within the reward range this time, on to
                the next one!
              </p>
            )
          }

          {/** User anwser bar **/}
          {isNotOpenedYet ? null : (
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
          )}
        </div>
      </div>

      <SecondOrderAnswerInfoDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
      ></SecondOrderAnswerInfoDrawer>
    </div>
  );
}
