import { OPTION_LABEL } from "@/app/components/AnswerResult/constants";
import { cn } from "@/lib/utils";
import { BestAnswerProps } from "@/types/answerPage";
import React from "react";

import BestAnswerBottomBar from "../BestAnswerBottomBar/BestAnswerBottomBar";
import BestAnswerHeading from "../BestAnswerHeading/BestAnswerHeading";

function MultiChoiceBestAnswer({
  questionOptions,
  bestOption,
  optionSelected,
}: BestAnswerProps) {
  return (
    <div className="bg-gray-700 p-4 rounded-xl my-3">
      <BestAnswerHeading />
      {questionOptions.map((qo, index) => (
        <div key={qo.id} className="flex flex-row gap-1 items-center my-2">
          <div
            className={cn(
              "w-[50px] h-[50px] bg-gray-600 rounded-lg flex items-center justify-center",
              {
                "bg-chomp-green-tiffany": qo.option === bestOption,
                "bg-destructive":
                  qo.option === optionSelected && qo.option !== bestOption,
              },
            )}
          >
            <p
              className={cn("text-sm font-bold text-white", {
                "!text-gray-800": qo.option === bestOption,
              })}
            >
              {OPTION_LABEL[index as keyof typeof OPTION_LABEL]}
            </p>
          </div>
          <div
            className={cn(
              "flex h-[50px] bg-transparent  gap-2  px-2 w-full py-3 text-sm font-semibold text-white rounded-lg border-solid border-gray-500 border",
              {
                "bg-chomp-green-turquoise": qo.option === bestOption,
                "border-chomp-green-tiffany": qo.option === bestOption,
              },
            )}
          >
            <div>{qo?.option}</div>
          </div>
        </div>
      ))}
      <BestAnswerBottomBar
        isUnanswered={optionSelected === null}
        isBestSelected={optionSelected === bestOption}
      />
    </div>
  );
}

export default MultiChoiceBestAnswer;
