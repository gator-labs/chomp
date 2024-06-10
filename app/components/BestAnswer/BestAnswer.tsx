import classNames from "classnames";
import { ReactElement } from "react";

type BestAnswerProps = {
  optionSelected?: string;
  bestOption: string;
  children?: ReactElement;
};

export function BestAnswer({
  optionSelected,
  bestOption,
  children,
}: BestAnswerProps) {
  return (
    <div className="bg-[#333333] p-4 rounded">
      <div className="font-sora text-base text-white mb-2">Best Answer</div>
      {children}
      {optionSelected && (
        <div className="text-gray font-bold text-sm flex items-center gap-1 mt-2">
          <div>You answered</div>
          <div
            className={classNames("text-black bg-aqua py-1 px-2 rounded-full", {
              "bg-warning": bestOption !== optionSelected,
            })}
          >
            {optionSelected}
          </div>
        </div>
      )}
    </div>
  );
}
