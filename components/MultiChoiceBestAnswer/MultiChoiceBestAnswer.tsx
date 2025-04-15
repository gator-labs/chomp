import { OPTION_LABEL } from "@/app/components/AnswerResult/constants";
import { cn } from "@/lib/utils";
import { QuestionOption } from "@prisma/client";
import React from "react";

import AquaCheckIcon from "../icons/AquaCheckIcon";
import RedXIcon from "../icons/RedXIcon";
import { UnansweredQuestionIcon } from "../icons/UnansweredQuestionIcon";

type MultiChoiceBestAnswerProps = {
  questionOptions: QuestionOption[];
  bestOption: string;
  optionSelected?: string | null;
};

function MultiChoiceBestAnswer({
  questionOptions,
  bestOption,
  optionSelected,
}: MultiChoiceBestAnswerProps) {
  return (
    <div className="bg-gray-700 p-4 rounded-xl my-3">
      <div className=" text-sm font-700 text-white mb-2">Best answer is...</div>
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

      <hr className="border-gray-600 my-4 p-0" />

      <div
        className={cn(
          "text-gray font-bold text-sm flex items-center justify-between gap-1 mt-2 ",
        )}
      >
        {optionSelected === null ? (
          <p className="text-gray-400">You didn&apos;t answer this question</p>
        ) : bestOption === optionSelected ? (
          <p className="text-chomp-green-tiffany">
            You picked the best answer:
          </p>
        ) : (
          <p className="text-destructive">You did not pick the best answer:</p>
        )}

        {optionSelected === null ? (
          <div className="rounded-full">
            <UnansweredQuestionIcon width={24} height={24} />{" "}
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

export default MultiChoiceBestAnswer;
