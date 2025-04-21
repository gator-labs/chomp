import { InfoIcon } from "@/app/components/Icons/InfoIcon";
import { cn } from "@/lib/utils";
import { QuestionOrderPercentage, UserAnswer } from "@/types/answerStats";

import SecondOrderAnswerInfoDrawer from "./SecondOrderAnswerInfoDrawer";
import AquaCheckIcon from "./icons/AquaCheckIcon";
import RedXIcon from "./icons/RedXIcon";

type SecondOrderAnswerResultsBinaryProps = {
  userAnswers: UserAnswer[];
  questionOptionPercentages: QuestionOrderPercentage[];
  answerStatus: boolean | null;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

export default function SecondOrderAnswerResultsBinary({
  userAnswers,
  questionOptionPercentages,
  answerStatus,
  isDrawerOpen,
  openDrawer,
  closeDrawer,
}: SecondOrderAnswerResultsBinaryProps) {
  const selectedAnswer = userAnswers.find((ans) => ans.selected);
  const selectedPercentage = selectedAnswer?.percentage ?? null;

  // if secondOrderAveragePercentagePicked is null we take it as 0
  const firstPercentage =
    questionOptionPercentages[0]?.secondOrderAveragePercentagePicked ?? 0;
  const secondPercentage =
    questionOptionPercentages[1]?.secondOrderAveragePercentagePicked ?? 0;

  // Is correct and we have an answer
  const isSelectedCorrect =
    answerStatus === true && selectedPercentage !== null;

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
  // replace all correctIncorrectOrUnanswered with answerStatusFix
  const answerStatusFix = isNotOpenedYet ? null : isSelectedCorrect;

  return (
    <div className="bg-gray-700 rounded-xl my-3">
      <div
        className={cn(
          "text-white flex justify-between items-center rounded-t-xl py-2 pl-4 pr-2",
          {
            "bg-dark-green": answerStatusFix === true,
            "bg-dark-red": answerStatusFix === false,
            "bg-gray-600": answerStatusFix === null,
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

      <div className="p-4">
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

        <div className="mt-4">
          {/** "Would choose the best answer" bar **/}
          <div className="flex items-center mb-1 w-full rounded-full overflow-hidden">
            <div
              className="h-14 bg-purple-500 flex items-center relative"
              style={{
                width: `${firstPercentage}%`,
                minWidth: `${firstPercentage}%`,
              }}
            >
              <div className="absolute whitespace-nowrap z-10">
                <p className="text-white font-[900] ml-4 inline">
                  {firstPercentage.toFixed(1)}%
                </p>
                <p className="text-white ml-2 inline">
                  would choose the best answer
                </p>
              </div>
            </div>
            <div
              className="h-14 bg-gray-800"
              style={{ width: `${100 - firstPercentage}%`, minWidth: "0.5rem" }}
            ></div>
          </div>

          <div className="text-white text-center my-2 font-medium">and</div>

          {/** "Would not" bar **/}
          <div className="flex items-center mb-1 w-full rounded-full overflow-hidden">
            <div
              className="h-14 bg-purple-500 flex items-center relative"
              style={{
                width: `${secondPercentage}%`,
                minWidth: `${secondPercentage}%`,
              }}
            >
              <div className="absolute whitespace-nowrap z-10">
                <p className="text-white font-[900] font-bold ml-4 inline">
                  {secondPercentage.toFixed(1)}%
                </p>
                <p className="text-white ml-2 inline">would not</p>
              </div>
            </div>
            <div
              className="h-14 bg-gray-800"
              style={{
                width: `${100 - secondPercentage}%`,
                minWidth: "0.5rem",
              }}
            ></div>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-600 pt-4">
          {isNotOpenedYet ? (
            <p className="text-sm text-gray-500 font-medium mb-2">
              You did not answer this question
            </p>
          ) : (
            <p className="text-sm text-white font-medium mb-2">
              Your prediction was that
            </p>
          )}

          {/** Your prediction bar **/}
          <div className="flex items-center mb-1 w-full rounded-full overflow-hidden mt-4">
            <div
              className={cn("h-14 flex items-center relative", {
                "bg-green": answerStatusFix,
                "bg-chomp-red-light": answerStatusFix === false,
                "bg-gray-800": answerStatusFix === null,
              })}
              style={{
                width: `${selectedPercentage ?? 0}%`,
                minWidth: `${selectedPercentage ?? 0}%`,
              }}
            >
              <div className="absolute whitespace-nowrap z-10">
                <p
                  className={cn("font-[900] ml-4 inline", {
                    "text-white": !isNotOpenedYet,
                    "text-gray-500 font-400": isNotOpenedYet,
                  })}
                >
                  {isNotOpenedYet
                    ? "N/A"
                    : (selectedPercentage?.toFixed(1) ?? "0") + "%"}
                </p>
                <p className="text-white ml-2 inline">
                  {isNotOpenedYet ? "" : "would choose the best answer"}
                </p>
              </div>
            </div>
            <div
              className="h-14 bg-gray-800"
              style={{
                width: `${100 - (selectedPercentage ?? 0)}%`,
                minWidth: "0.5rem",
              }}
            />
          </div>
        </div>
      </div>

      <SecondOrderAnswerInfoDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
      ></SecondOrderAnswerInfoDrawer>
    </div>
  );
}
