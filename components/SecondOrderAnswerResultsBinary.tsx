import { InfoIcon } from "@/app/components/Icons/InfoIcon";
import { cn } from "@/lib/utils";

import AquaCheckIcon from "./icons/AquaCheckIcon";
import RedXIcon from "./icons/RedXIcon";

type SecondOrderAnswerResultsBinaryProps = {
  aPercentage: number;
  bPercentage: number;
  isSelectedCorrectNullIfNotOpened: boolean | null;
  selectedPercentage: number;
  openSecOrdAnsInfDrawer: () => void;
};

export default function SecondOrderAnswerResultsBinary({
  aPercentage,
  bPercentage,
  isSelectedCorrectNullIfNotOpened,
  selectedPercentage,
  openSecOrdAnsInfDrawer,
}: SecondOrderAnswerResultsBinaryProps) {
  // Mystery Box is not opened yet so we don't know if the user is right or wrong
  const isNotOpenedYet = isSelectedCorrectNullIfNotOpened === null;

  return (
    <div className="bg-gray-700 rounded-xl my-3">
      <div
        className={cn(
          "text-white flex justify-between items-center rounded-t-xl py-2 px-4",
          {
            "bg-dark-green": isSelectedCorrectNullIfNotOpened === true,
            "bg-dark-red": isSelectedCorrectNullIfNotOpened === false,
            "bg-gray-600": isSelectedCorrectNullIfNotOpened === null,
          },
        )}
      >
        <p className="pl-2 font-bold">Second Order Answer</p>

        {isNotOpenedYet ? null : isSelectedCorrectNullIfNotOpened ? (
          <AquaCheckIcon width={32} height={32} />
        ) : (
          <RedXIcon width={32} height={32} />
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center text-white mb-2">
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
                <p className="text-white font-bold ml-4 inline">
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
                <p className="text-white font-bold ml-4 inline">
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
                "bg-green": isSelectedCorrectNullIfNotOpened === true,
                "bg-chomp-red-light":
                  isSelectedCorrectNullIfNotOpened === false,
                "bg-gray-800": isNotOpenedYet,
              })}
              style={{
                width: `${selectedPercentage}%`,
                minWidth: `${selectedPercentage}%`,
              }}
            >
              <div className="absolute whitespace-nowrap z-10">
                <p
                  className={cn("font-bold ml-4 inline", {
                    "text-white": !isNotOpenedYet,
                    "text-gray-500 font-400": isNotOpenedYet,
                  })}
                >
                  {isNotOpenedYet ? "N/A" : selectedPercentage.toFixed(1) + "%"}
                </p>
                <p className="text-white ml-2 inline">
                  {isNotOpenedYet ? "" : "would choose the best answer"}
                </p>
              </div>
            </div>
            <div
              className="h-14 bg-gray-800"
              style={{ width: `${selectedPercentage}%`, minWidth: "0.5rem" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
