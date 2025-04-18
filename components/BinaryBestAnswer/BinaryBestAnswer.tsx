import { cn } from "@/app/utils/tailwind";
import { BestAnswerProps } from "@/types/answerPage";
import React from "react";

import BestAnswerBottomBar from "../BestAnswerBottomBar/BestAnswerBottomBar";
import BestAnswerHeading from "../BestAnswerHeading/BestAnswerHeading";

function BinaryBestAnswer({
  questionOptions,
  bestOption,
  optionSelected,
}: BestAnswerProps) {
  return (
    <div className="bg-gray-700 p-4 rounded-xl my-3">
      <BestAnswerHeading />
      {questionOptions.map((qo) => (
        <div
          className={cn(
            "flex items-center justify-center bg-chomp-green-tiffany gap-2 w-full  py-3 text-sm font-semibold text-white rounded-lg my-4",
            {
              "bg-gray-600": !qo.calculatedIsCorrect,
              "text-gray-500": !qo.calculatedIsCorrect,
            },
          )}
          key={qo.id}
        >
          <div>{qo?.option}</div>
        </div>
      ))}

      <BestAnswerBottomBar
        isUnanswered={optionSelected === null}
        isBestSelected={optionSelected === bestOption}
      />
    </div>
  );
}

export default BinaryBestAnswer;
