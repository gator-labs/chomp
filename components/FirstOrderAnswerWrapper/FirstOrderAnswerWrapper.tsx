import { cn } from "@/lib/utils";
import { UserResponseProps } from "@/types/answerPage";
import React from "react";

import AquaCheckIcon from "../icons/AquaCheckIcon";
import RedXIcon from "../icons/RedXIcon";

function FirstOrderAnswerWrapper({
  isUnanswered,
  isBestSelected,
  children,
}: UserResponseProps) {
  return (
    <div className="bg-gray-700 rounded-xl my-3">
      <div
        className={cn(
          "flex justify-between items-center bg-chomp-red-dusty rounded-t-xl p-2 pl-4",
          {
            "bg-gray-600": isUnanswered,
            "bg-chomp-aqua-light": isBestSelected,
          },
        )}
      >
        <p>First Order Answer</p>
        {!isUnanswered && (
          <>
            {isBestSelected ? (
              <AquaCheckIcon width={32} height={32} />
            ) : (
              <RedXIcon width={32} height={32} />
            )}
          </>
        )}
      </div>
      {children}
    </div>
  );
}

export default FirstOrderAnswerWrapper;
