import { cn } from "@/lib/utils";
import { UserResponseProps } from "@/types/answerPage";
import React from "react";

import AquaCheckIcon from "../icons/AquaCheckIcon";
import RedXIcon from "../icons/RedXIcon";
import { UnansweredQuestionIcon } from "../icons/UnansweredQuestionIcon";

function BestAnswerBottomBar({
  isUnanswered,
  isBestSelected,
}: UserResponseProps) {
  return (
    <>
      {" "}
      <hr className="border-gray-600 my-4 p-0 h-[1px]" />
      <div
        className={cn(
          "text-gray font-bold text-sm flex items-center justify-between gap-1",
        )}
      >
        {isUnanswered ? (
          <p className="text-gray-400">You didn&apos;t answer this question</p>
        ) : isBestSelected ? (
          <p className="text-chomp-green-tiffany">
            You picked the best answer:
          </p>
        ) : (
          <p className="text-destructive">You did not pick the best answer:</p>
        )}

        {isUnanswered ? (
          <div className="rounded-full">
            <UnansweredQuestionIcon width={32} height={32} />
          </div>
        ) : isBestSelected ? (
          <AquaCheckIcon width={32} height={32} />
        ) : (
          <RedXIcon width={32} height={32} />
        )}
      </div>
    </>
  );
}

export default BestAnswerBottomBar;
