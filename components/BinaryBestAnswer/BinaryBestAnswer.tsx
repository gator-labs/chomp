import { QuestionUnansweredIcon } from "@/app/components/Icons/QuestionUnansweredIcon";
import { cn } from "@/app/utils/tailwind";
import { QuestionOption } from "@prisma/client";
import React from "react";

import AquaCheckIcon from "../icons/AquaCheckIcon";
import RedXIcon from "../icons/RedXIcon";

type BinaryBestAnswerProps = {
  questionOptions: QuestionOption[];
  bestOption: string;
  optionSelected?: string | null;
};
function BinaryBestAnswer({
  questionOptions,
  bestOption,
  optionSelected,
}: BinaryBestAnswerProps) {
  return (
    <div className="bg-gray-700 p-4 rounded-xl my-3">
      <div className=" text-sm font-700 text-white mb-2">Best answer is...</div>
      {questionOptions.map((qo) => (
        <div
          className={cn(
            "flex items-center justify-center bg-aqua gap-2 w-full  py-3 text-sm font-semibold text-white rounded-lg my-4",
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

      <hr className="border-gray-600 my-4 p-0" />

      <div
        className={cn(
          "text-gray font-bold text-sm flex items-center justify-between gap-1 mt-2 text-destructive",
          {
            "text-white": optionSelected === null,
            "text-aqua": bestOption === optionSelected,
          },
        )}
      >
        <p>
          {optionSelected === null
            ? "You did not answer"
            : bestOption === optionSelected
              ? "You picked best answer:"
              : "You did not pick best answer:"}
        </p>
        {optionSelected === null ? (
          <div className="rounded-full">
            <QuestionUnansweredIcon width={24} height={24} />{" "}
          </div>
        ) : bestOption === optionSelected ? (
          <AquaCheckIcon width={24} height={24} />
        ) : (
          <RedXIcon width={24} height={24} />
        )}
      </div>
    </div>
  );
}

export default BinaryBestAnswer;
