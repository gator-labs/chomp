import { InfoIcon } from "@/app/components/Icons/InfoIcon";
import { cn } from "@/lib/utils";

import AquaCheckIcon from "./icons/AquaCheckIcon";
import RedXIcon from "./icons/RedXIcon";

type SecondOrderAnswerResultsBinaryProps = {
  aPercentage: number;
  bPercentage: number;
  isSelectedCorrectNullIfNotOpened: boolean | null;
  selectedPercentage: number | null;
  openSecOrdAnsInfDrawer: () => void;
};

export default function SecondOrderAnswerResultsBinary({
  aPercentage,
  bPercentage,
  isSelectedCorrectNullIfNotOpened,
  selectedPercentage,
  openSecOrdAnsInfDrawer,
}: SecondOrderAnswerResultsBinaryProps) {
  // Is correct and we have an answer
  const isSelectedCorrect =
    isSelectedCorrectNullIfNotOpened === true && selectedPercentage !== null;

  // WARNING: this could be hidding a bug, its gonna be reviewed in
  // https://linear.app/gator/issue/PROD-1029/issecondordercorrect-true-even-though-no-2nd-order-answer
  // Mystery Box is not opened yet so we don't know if the user is right or wrong or there's no answer
  const isNotOpenedYet =
    isSelectedCorrectNullIfNotOpened === null || selectedPercentage === null;

  if (
    isSelectedCorrectNullIfNotOpened === true &&
    selectedPercentage === null
  ) {
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

  return (
    <div className="bg-gray-700 rounded-xl my-3">
      <div
        className={cn(
          "text-white flex justify-between items-center rounded-t-xl py-2 px-4",
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

      <div className="p-4">
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

        <div className="mt-4">
          {/** "Would choose the best answer" bar **/}
          <div className="flex items-center mb-1 w-full rounded-full overflow-hidden">
            <div
              className="h-14 bg-purple-500 flex items-center relative"
              style={{ width: `${aPercentage}%`, minWidth: `${aPercentage}%` }}
            >
              <div className="absolute whitespace-nowrap z-10">
                <p className="text-white font-[900] ml-4 inline">
                  {aPercentage.toFixed(1)}%
                </p>
                <p className="text-white ml-2 inline">
                  would choose the best answer
                </p>
              </div>
            </div>
            <div
              className="h-14 bg-gray-800"
              style={{ width: `${100 - aPercentage}%`, minWidth: "0.5rem" }}
            ></div>
          </div>

          <div className="text-white text-center my-2 font-medium">and</div>

          {/** "Would not" bar **/}
          <div className="flex items-center mb-1 w-full rounded-full overflow-hidden">
            <div
              className="h-14 bg-purple-500 flex items-center relative"
              style={{ width: `${bPercentage}%`, minWidth: `${bPercentage}%` }}
            >
              <div className="absolute whitespace-nowrap z-10">
                <p className="text-white font-[900] font-bold ml-4 inline">
                  {bPercentage.toFixed(1)}%
                </p>
                <p className="text-white ml-2 inline">would not</p>
              </div>
            </div>
            <div
              className="h-14 bg-gray-800"
              style={{ width: `${100 - bPercentage}%`, minWidth: "0.5rem" }}
            ></div>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-600 pt-4">
          {isNotOpenedYet ? (
            <p className="text-gray-500 font-medium mb-2">
              You did not answer this question
            </p>
          ) : (
            <p className="text-white font-medium mb-2">
              Your prediction was that
            </p>
          )}

          {/** Your prediction bar **/}
          <div className="flex items-center mb-1 w-full rounded-full overflow-hidden mt-4">
            <div
              className={cn("h-14 flex items-center relative", {
                "bg-green": correctIncorrectOrUnanswered,
                "bg-chomp-red-light": correctIncorrectOrUnanswered === false,
                "bg-gray-800": correctIncorrectOrUnanswered === null,
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
    </div>
  );
}
